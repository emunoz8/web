package com.compilingjava.auth.service.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSender {

    private final JavaMailSender mailSender;

    // Use a dedicated app property instead of relying on the SMTP username
    @Value("${app.mail.from:no-reply@compilingjava.com}")
    private String defaultFrom;

    /** Plain-text email (current behavior) */
    @Async
    public void send(String to, String subject, String body) {
        SimpleMailMessage m = new SimpleMailMessage();
        m.setFrom(defaultFrom);
        m.setTo(to);
        m.setSubject(subject);
        m.setText(body);
        mailSender.send(m);
        log.debug("Sent plain email to {}", to);
    }

    /** HTML email (for nicer templates / clickable CTAs) */
    @Async
    public void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
            helper.setFrom(defaultFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true => HTML
            mailSender.send(mime);
            log.debug("Sent HTML email to {}", to);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }
}
