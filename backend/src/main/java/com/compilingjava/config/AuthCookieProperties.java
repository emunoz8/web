package com.compilingjava.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.cookie")
@Getter
@Setter
public class AuthCookieProperties {
    private String name = "access_token";
    private String path = "/";
    private String sameSite = "Lax";
    private boolean secure = false;
    private String domain;
}
