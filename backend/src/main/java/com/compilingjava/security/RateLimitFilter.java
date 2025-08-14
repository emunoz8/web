package com.compilingjava.security;

import com.compilingjava.common.ratelimit.RateLimiterService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter implements Filter {

    private static final String TARGET_PATH = "/auth/verify/resend";

    private final RateLimiterService rateLimiter;

    public RateLimitFilter(RateLimiterService rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest r = (HttpServletRequest) req;
        HttpServletResponse w = (HttpServletResponse) res;

        if ("POST".equalsIgnoreCase(r.getMethod()) && TARGET_PATH.equals(r.getRequestURI())) {
            String ip = clientIp(r);
            if (!rateLimiter.tryConsumeResendIp(ip)) {
                w.setStatus(429);
                w.setContentType("application/json");
                // Optional: include a Retry-After header if you like
                // w.setHeader("Retry-After", String.valueOf(rateLimiter.secondsUntilResendIp(ip)));
                w.getWriter().write("{\"error\":\"too_many_requests\"}");
                return;
            }
        }

        chain.doFilter(req, res);
    }

    private String clientIp(HttpServletRequest r) {
        String xf = r.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            int comma = xf.indexOf(',');
            return (comma > 0 ? xf.substring(0, comma) : xf).trim();
        }
        return r.getRemoteAddr() == null ? "unknown" : r.getRemoteAddr();
    }
}
