package com.boot.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.boot.dao.StockInfoDAO;
import com.boot.dto.StockInfoDTO;
import com.boot.dto.StockNewsDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockInfoServiceImpl implements StockInfoService {

    private final StockInfoDAO stockInfoDAO;

    @Override
    public List<StockInfoDTO> searchStocks(String keyword) {
        return stockInfoDAO.searchStocks(keyword);
    }

    @Override
    public StockInfoDTO getStockDetail(String stockCode) {
        return stockInfoDAO.getStockDetail(stockCode);
    }
    
    @Override
    public Map<String, Object> searchIntegrated(String keyword) {
        Map<String, Object> result = new HashMap<>();

        // 1. 종목 검색 (이미 개선된 SQL 사용: 대소문자 무시, 시총 정렬)
        List<StockInfoDTO> stocks = stockInfoDAO.searchStocks(keyword);
        
        // 2. 뉴스 검색 (아까 추가한 searchNews SQL 사용)
        List<StockNewsDTO> news = stockInfoDAO.searchNews(keyword);

        // 3. 묶어서 반환
        result.put("stocks", stocks);
        result.put("news", news);

        return result;
    }
}
