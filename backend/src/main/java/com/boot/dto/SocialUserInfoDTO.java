package com.boot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialUserInfoDTO {
    private String email;     // 소셜 이메일
    private String fullName;  // 닉네임 또는 이름
    private String provider;  // KAKAO / NAVER / GOOGLE
}
