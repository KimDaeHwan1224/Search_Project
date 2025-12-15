package com.boot.security;

import io.jsonwebtoken.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtProvider {

    // JWT 키
	@Value("${jwt.secret}")
    private String secret;

    // Access Token 만료시간
	@Value("${jwt.access-expiration}")
    private long accessExpiration;


    // Refresh Token 만료시간
	@Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    // Access Token 생성
    public String createAccessToken(String email, String role) {
        Date now = new Date();

        return Jwts.builder()
                .setSubject(email) // 토큰에 저장할 값 (여기서는 email)
                .claim("role", role)
                .setIssuedAt(now) // 발급 시간
                .setExpiration(new Date(now.getTime() + accessExpiration)) // 만료 시간
                .signWith(SignatureAlgorithm.HS256, secret) // 암호화 방식
                .compact();
    }

    // Refresh Token 생성
    public String createRefreshToken(String email, String role) {
        Date now = new Date();

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + refreshExpiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    // JWT → email 추출
    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token) // 토큰 검증 후 Claims 추출
                .getBody()
                .getSubject();
    }
    
    // JWT → role 추출
    public String getRoleFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
    // JWT 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
