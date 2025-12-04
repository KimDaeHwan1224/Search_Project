package com.boot.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.boot.dto.SocialUserInfoDTO;

import lombok.RequiredArgsConstructor;

//com.boot.service.KakaoOAuthService

@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

 @Value("${kakao.client-id}")
 private String clientId;

 @Value("${kakao.redirect-uri}")
 private String redirectUri;

 private final RestTemplate restTemplate = new RestTemplate();

 public SocialUserInfoDTO getUserInfo(String code) {

     // 1) AccessToken 요청
     String tokenUrl = "https://kauth.kakao.com/oauth/token";

     MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
     params.add("grant_type", "authorization_code");
     params.add("client_id", clientId);
     params.add("redirect_uri", redirectUri);
     params.add("code", code);

     HttpHeaders headers = new HttpHeaders();
     headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

     HttpEntity<?> request = new HttpEntity<>(params, headers);

     Map<String, Object> tokenResponse =
             restTemplate.postForObject(tokenUrl, request, Map.class);

     String accessToken = (String) tokenResponse.get("access_token");

     // 2) 사용자 정보 요청
     HttpHeaders infoHeader = new HttpHeaders();
     infoHeader.add("Authorization", "Bearer " + accessToken);

     HttpEntity<?> infoRequest = new HttpEntity<>(infoHeader);

     ResponseEntity<Map> response = restTemplate.exchange(
             "https://kapi.kakao.com/v2/user/me",
             HttpMethod.GET,
             infoRequest,
             Map.class
     );

     Map<String, Object> userInfo = response.getBody();

     Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");
     Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

     String email = (String) kakaoAccount.get("email");
     String nickname = (String) profile.get("nickname");

     // 👉 여기서 공통 DTO 로 변환해서 넘겨줌
     return new SocialUserInfoDTO(email, nickname, "KAKAO");
 }
}

