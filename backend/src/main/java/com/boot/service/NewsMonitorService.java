package com.boot.service;

import com.boot.dao.NewsMonitorDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NewsMonitorService {

    private final NewsMonitorDAO newsMonitorDAO;

    // 기본 임계치(원하면 나중에 CONTROL TABLE로 바꿀 수 있음)
    private static final long NORMAL_MIN = 10; // 10분 이내 정상
    private static final long DELAY_MIN  = 30; // 30분 이내 지연

    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public Map<String, Object> getRefreshStatus() {

        // 1) 마지막 수집 시각
        Map<String, Object> row = newsMonitorDAO.getLastNewsCreatedAt();
        Object raw = (row == null) ? null : row.get("LAST_CREATED_AT");

        Map<String, Object> res = new HashMap<>();

        // 2) 통계(카드 3개)
        int totalNews = newsMonitorDAO.countAllNews();
        int recent1h = newsMonitorDAO.countRecentNews();
        int unanalyzed = newsMonitorDAO.countUnanalyzedNews();

        res.put("totalNews", totalNews);
        res.put("recent1h", recent1h);
        res.put("unanalyzed", unanalyzed);

        // 3) 데이터가 0이면 상태도 FAIL 처리(원하는 메시지로)
        if (raw == null) {
            res.put("status", "FAIL");
            res.put("lastCreatedAt", null);
            res.put("delayMinutes", null);
            res.put("message", "뉴스 데이터가 없습니다 (크롤링 미동작/DB 미삽입)");
            return res;
        }

        // 4) LAST_CREATED_AT 파싱(Oracle DATE가 Timestamp로 오는 경우가 많음)
        LocalDateTime last;
        if (raw instanceof Timestamp) {
            last = ((Timestamp) raw).toLocalDateTime();
        } else {
            // 문자열로 들어오는 경우 대비
            String s = raw.toString().replace("T", " ");
            if (s.length() >= 19) s = s.substring(0, 19);
            last = LocalDateTime.parse(s, fmt);
        }

        LocalDateTime now = LocalDateTime.now();
        long diffMin = Duration.between(last, now).toMinutes();

        String status;
        String message;

        if (diffMin <= NORMAL_MIN) {
            status = "NORMAL";
            message = "정상 갱신 중";
        } else if (diffMin <= DELAY_MIN) {
            status = "DELAY";
            message = "갱신 지연 (모니터링 필요)";
        } else {
            status = "FAIL";
            message = "갱신 실패 의심 (스케줄러/크롤러 확인 필요)";
        }

        res.put("status", status);
        res.put("lastCreatedAt", last.format(fmt));
        res.put("delayMinutes", diffMin);
        res.put("message", message);

        return res;
    }
}
