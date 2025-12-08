// src/com/boot/service/IndexReadService.java

package com.boot.service;

import com.boot.dao.IndexDAO;
import com.boot.dto.IndexDataDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service // 반드시 @Service로 등록해야 Spring Bean으로 인식되어 AOP 프록시가 적용됩니다.
public class IndexReadService {

    @Autowired private IndexDAO indexDAO;
    
    private static final String KOSPI_CACHE_NAME = "kospiHistoryCache";
    private static final String KOSDAQ_CACHE_NAME = "kosdaqHistoryCache";
    private static final String KOSPI_CACHE_KEY = "'kospi_all'";
    private static final String KOSDAQ_CACHE_KEY = "'kosdaq_all'";


    // KOSPI 조회 (이제 이 메서드가 외부에 의해 호출되면 @Cacheable이 확실히 작동합니다.)
    @Cacheable(value = KOSPI_CACHE_NAME, key = KOSPI_CACHE_KEY)
    public List<IndexDataDTO> getKospiTimeSeriesData() {
        System.out.println("⭐️ [Cache Miss] DB에서 KOSPI 히스토리 조회 중 (1457건 로드)...");
        return indexDAO.selectKospiHistory(); // 1457건 로드 가정
    }

    // KOSDAQ 조회
    @Cacheable(value = KOSDAQ_CACHE_NAME, key = KOSDAQ_CACHE_KEY)
    public List<IndexDataDTO> getKosdaqTimeSeriesData() {
        System.out.println("⭐️ [Cache Miss] DB에서 KOSDAQ 히스토리 조회 중...");
        return indexDAO.selectKosdaqHistory();
    }
}