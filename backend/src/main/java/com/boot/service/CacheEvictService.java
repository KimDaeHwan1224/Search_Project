// src/com/boot/service/CacheEvictService.java

package com.boot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class CacheEvictService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void evictKospiHistoryCache() {
        redisTemplate.delete("kospiHistoryCache::kospi_all");
        System.out.println("🔥 Redis에서 KOSPI 캐시 직접 삭제 완료");
    }

    public void evictKosdaqHistoryCache() {
        redisTemplate.delete("kosdaqHistoryCache::kosdaq_all");
        System.out.println("🔥 Redis에서 KOSDAQ 캐시 직접 삭제 완료");
    }
}
