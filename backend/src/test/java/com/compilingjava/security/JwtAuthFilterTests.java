package com.compilingjava.security;

import com.compilingjava.security.jwt.JwtService;
import com.compilingjava.security.jwt.JwtService.AccessClaims;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class JwtAuthFilterTests {

    @Test
    void validBearer_setsAuthentication() throws Exception {
        var jwt = mock(JwtService.class);
        var uds = mock(UserDetailsService.class);
        var filter = new JwtAuthFilter(jwt, uds);

        var req = mock(HttpServletRequest.class);
        var res = mock(HttpServletResponse.class);
        var chain = mock(FilterChain.class);

        when(req.getMethod()).thenReturn("GET");
        when(req.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer abc");

        var claims = new AccessClaims("edwin", "edwin@example.com",
                UUID.randomUUID(), Instant.now().plusSeconds(600), List.of("ROLE_USER"));
        when(jwt.parseAccessToken("abc")).thenReturn(claims);

        var user = new TestUser("edwin", "pw", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        when(uds.loadUserByUsername("edwin")).thenReturn(user);

        SecurityContextHolder.clearContext();
        filter.doFilter(req, res, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("edwin");
        verify(chain).doFilter(req, res);
    }

    static class TestUser implements UserDetails {
        private final String u;
        private final String p;
        private final List<SimpleGrantedAuthority> a;

        TestUser(String u, String p, List<SimpleGrantedAuthority> a) {
            this.u = u;
            this.p = p;
            this.a = a;
        }

        public List<SimpleGrantedAuthority> getAuthorities() {
            return a;
        }

        public String getPassword() {
            return p;
        }

        public String getUsername() {
            return u;
        }

        public boolean isAccountNonExpired() {
            return true;
        }

        public boolean isAccountNonLocked() {
            return true;
        }

        public boolean isCredentialsNonExpired() {
            return true;
        }

        public boolean isEnabled() {
            return true;
        }
    }
}
