package com.boot.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendVerificationMail(String to, String token) {

        String link = "https://frontend.com/verify?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[검색엔진 프로젝트] 이메일 인증 요청");
        message.setText(
                "아래 링크를 클릭하여 이메일 인증을 완료해주세요.\n\n"
                + link + "\n\n"
                + "본 인증 링크는 30분 동안 유효합니다."
        );

        mailSender.send(message);
    }
}
