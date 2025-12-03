package com.boot.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.boot.dao.StockNewsDAO;
import com.boot.dto.StockNewsDTO;
import com.boot.dto.SentimentSummaryDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockNewsServiceImpl implements StockNewsService {

    private final StockNewsDAO stockNewsDAO;

    @Override
    public List<StockNewsDTO> getNewsByStock(String stockCode) {
        return stockNewsDAO.getNewsByStock(stockCode);
    }

    @Override
    public SentimentSummaryDTO getSentimentSummary(String stockCode) {

        Map<String, Object> result = stockNewsDAO.getSentimentSummary(stockCode);

        // 결과가 없으면 기본값 반환
        if (result == null) {
            return new SentimentSummaryDTO(0, 0, 0, 0.0, 0.0, 0);
        }

        // 안전한 값 추출
        int positive = getNumber(result.get("POSITIVE"));
        int negative = getNumber(result.get("NEGATIVE"));
        int neutral = getNumber(result.get("NEUTRAL"));

        SentimentSummaryDTO dto = new SentimentSummaryDTO();
        dto.setPositiveCount(positive);
        dto.setNegativeCount(negative);
        dto.setNeutralCount(neutral);

        int total = positive + negative + neutral;

        if (total > 0) {
            dto.setPositiveRate(positive * 100.0 / total);
            dto.setNegativeRate(negative * 100.0 / total);
        } else {
            dto.setPositiveRate(0);
            dto.setNegativeRate(0);
        }

        return dto;
    }

    // ★ 안전한 숫자 변환 함수
    private int getNumber(Object val) {
        if (val == null) return 0;
        return ((Number) val).intValue();
    }

}
