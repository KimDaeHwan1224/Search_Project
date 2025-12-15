package com.boot.service;

import com.boot.dao.IndexDAO;
import com.boot.dto.IndexDataDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.*;

import javax.annotation.PostConstruct;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IndexService {

    @Autowired
    private IndexDAO indexDAO;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private CacheEvictService cacheEvictService;

    // ✅ 환경변수 주입
    @Value("${market.api.service-key}")
    private String SERVICE_KEY;

    private static final String API_ENDPOINT =
            "https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService/getStockMarketIndex";

    private static final int ROWS_PER_PAGE = 500;
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd");

    // ================= 상수 =================
    private static final String TARGET_INDEX = "코스피";
    private static final String TARGET_INDEX_KOSDAQ = "코스닥";

    private static final String START_DATE = "19800104";
    private static final String START_DATE_KOSDAQ = "19960701";

    // ================= XML 파싱 =================
    private String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag);
        if (nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return null;
    }

    private List<IndexDataDTO> parseXml(String xmlData) {
        List<IndexDataDTO> resultList = new ArrayList<>();
        try {
            DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlData.getBytes("UTF-8")));
            doc.getDocumentElement().normalize();

            int totalCount = Integer.parseInt(
                    doc.getElementsByTagName("totalCount").item(0).getTextContent()
            );

            NodeList itemList = doc.getElementsByTagName("item");

            for (int i = 0; i < itemList.getLength(); i++) {
                Element e = (Element) itemList.item(i);
                IndexDataDTO dto = new IndexDataDTO();

                dto.setIdxNm(getTagValue("idxNm", e));
                dto.setBasDt(getTagValue("basDt", e));

                try { dto.setClpr(Double.parseDouble(getTagValue("clpr", e))); } catch (Exception ignored) {}
                try { dto.setVs(Double.parseDouble(getTagValue("vs", e))); } catch (Exception ignored) {}
                try { dto.setFltRt(Double.parseDouble(getTagValue("fltRt", e))); } catch (Exception ignored) {}
                try { dto.setMkp(Double.parseDouble(getTagValue("mkp", e))); } catch (Exception ignored) {}
                try { dto.setHipr(Double.parseDouble(getTagValue("hipr", e))); } catch (Exception ignored) {}
                try { dto.setLopr(Double.parseDouble(getTagValue("lopr", e))); } catch (Exception ignored) {}
                try { dto.setTrqu(Long.parseLong(getTagValue("trqu", e))); } catch (Exception ignored) {}
                try { dto.setTrPrc(Long.parseLong(getTagValue("trPrc", e))); } catch (Exception ignored) {}
                try { dto.setLstgMrktTotAmt(Long.parseLong(getTagValue("lstgMrktTotAmt", e))); } catch (Exception ignored) {}

                if (i == 0) dto.setTotalCount(totalCount);
                resultList.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return resultList;
    }

    // ================= URL 생성 =================
    private String buildApiUrl(String idxNm, int pageNo, int rows, String begin, String end) {
        return UriComponentsBuilder.fromUriString(API_ENDPOINT)
                .queryParam("serviceKey", SERVICE_KEY)
                .queryParam("resultType", "xml")
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", rows)
                .queryParam("idxNm", idxNm)
                .queryParam("beginBasDt", begin)
                .queryParam("endBasDt", end)
                .build(false)
                .toUriString();
    }

    // ================= 서버 시작 자동 동기화 =================
    @PostConstruct
    public void autoSync() {
        updateMissingIndexData(
                TARGET_INDEX,
                START_DATE,
                indexDAO.countIndexData(TARGET_INDEX),
                indexDAO.selectLatestBasDt(TARGET_INDEX)
        );

        updateMissingIndexData(
                TARGET_INDEX_KOSDAQ,
                START_DATE_KOSDAQ,
                indexDAO.countKosdaqIndexData(TARGET_INDEX_KOSDAQ),
                indexDAO.selectLatestKosdaqBasDt(TARGET_INDEX_KOSDAQ)
        );
    }

    // ================= 핵심 수집 로직 =================
    @Transactional
    protected void updateMissingIndexData(String idxNm, String start, int count, String latest) {
        String begin = start;

        if (count > 0 && latest != null) {
            begin = LocalDate.parse(latest, DATE_FORMATTER)
                    .plusDays(1)
                    .format(DATE_FORMATTER);
        }

        String today = LocalDate.now().format(DATE_FORMATTER);
        if (begin.compareTo(today) > 0) return;

        collectAndSave(idxNm, begin, today);
    }

    @Transactional
    protected void collectAndSave(String idxNm, String begin, String end) {
        String firstUrl = buildApiUrl(idxNm, 1, 1, begin, end);
        String xml = restTemplate.getForObject(firstUrl, String.class);
        List<IndexDataDTO> init = parseXml(xml);

        if (init.isEmpty()) return;

        int total = init.get(0).getTotalCount();
        int pages = (int) Math.ceil((double) total / ROWS_PER_PAGE);

        for (int p = 1; p <= pages; p++) {
            String url = buildApiUrl(idxNm, p, ROWS_PER_PAGE, begin, end);
            List<IndexDataDTO> list =
                    parseXml(restTemplate.getForObject(url, String.class));

            for (IndexDataDTO dto : list) {
                if (idxNm.equals(TARGET_INDEX)) {
                    indexDAO.insertOrUpdateIndexData(dto);
                } else {
                    indexDAO.insertOrUpdateKosdaqIndexData(dto);
                }
            }
        }

        if (idxNm.equals(TARGET_INDEX)) {
            cacheEvictService.evictKospiHistoryCache();
        } else {
            cacheEvictService.evictKosdaqHistoryCache();
        }
    }

    // ================= 단일 날짜 수집 =================
    @Transactional
    public void saveSingleDayData(String date) {
        collectAndSave(TARGET_INDEX, date, date);
    }

    @Transactional
    public void saveSingleKosdaqDayData(String date) {
        collectAndSave(TARGET_INDEX_KOSDAQ, date, date);
    }

    // ================= 최신 지수 조회 =================
    public Map<String, Object> getLatestIndexData() {
        Map<String, Object> map = new HashMap<>();
        map.put("kospi", indexDAO.selectLatestKospi());
        map.put("kosdaq", indexDAO.selectLatestKosdaq());
        return map;
    }
}
