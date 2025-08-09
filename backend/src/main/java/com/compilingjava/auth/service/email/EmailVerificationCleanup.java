package com.compilingjava.auth.service.email;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@EnableScheduling
public class EmailVerificationCleanup {
    private final EmailVerificationService svc;

    @Scheduled(cron = "0 0 3 * * *") // 3am daily
    public void run() {
        svc.cleanupExpired();
    }
}
