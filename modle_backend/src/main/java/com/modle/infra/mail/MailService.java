package com.modle.infra.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    // 이메일 발송 공통 메서드
    public void send(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    // 이메일 인증 코드 발송
    public void sendVerificationCode(String to, String code) {
        String subject = "[모들] 이메일 인증 코드";
        String text = """
                안녕하세요. 모들입니다.
                
                이메일 인증 코드: %s
                
                인증 코드는 5분 후 만료됩니다.
                본인이 요청하지 않은 경우 이 메일을 무시해주세요.
                """.formatted(code);
        send(to, subject, text);
    }

    // 의뢰인 승인 완료 이메일
    public void sendApprovalEmail(String to) {
        String subject = "[모들] 가입 승인 완료";
        String text = """
                안녕하세요. 모들입니다.
                
                회원가입 승인이 완료되었습니다.
                이제 모들의 모든 서비스를 이용하실 수 있습니다.
                """;
        send(to, subject, text);
    }

    // 의뢰인 가입 반려 이메일
    public void sendRejectionEmail(String to, String reason) {
        String subject = "[모들] 가입 반려 안내";
        String text = """
                안녕하세요. 모들입니다.
                
                아쉽게도 회원가입이 반려되었습니다.
                
                반려 사유: %s
                """.formatted(reason);
        send(to, subject, text);
    }

    // 신고 수락 안내 — 피신고자에게
    public void sendReportActionedEmail(String to) {
        String subject = "[모들] 신고 처리 결과 안내";
        String text = """
            안녕하세요. 모들입니다.
            
            회원님의 활동에 대한 신고가 접수되어 검토한 결과,
            서비스 이용 정책 위반으로 확인되었습니다.
            
            경고 횟수가 누적될 경우 서비스 이용이 제한될 수 있습니다.
            앞으로 건전한 서비스 이용을 부탁드립니다.
            """;
        send(to, subject, text);
    }

    // 신고 거절 안내 — 신고자에게
    public void sendReportDismissedEmail(String to, String reason) {
        String subject = "[모들] 신고 처리 결과 안내";
        String text = """
            안녕하세요. 모들입니다.
            
            접수하신 신고를 검토한 결과, 아래 사유로 처리되지 않았습니다.
            
            사유: %s
            
            추가 문의사항이 있으시면 고객센터로 연락해주세요.
            """.formatted(reason);
        send(to, subject, text);
    }
}
