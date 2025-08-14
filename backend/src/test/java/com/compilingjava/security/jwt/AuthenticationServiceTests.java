package com.compilingjava.security.jwt;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTests {

    @Mock
    UserRepository users;
    @Mock
    PasswordEncoder encoder;
    @Mock
    JwtService jwt;
    @InjectMocks
    AuthenticationService svc;

    private static User user(String username, String email, String hash, boolean verified) {
        var u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPasswordHash(hash);
        u.setEmailVerified(verified);
        return u;
    }

    @Test
    void authenticate_returnsAccessToken() {
        var req = new AuthRequest();
        req.setUsername("edwin");
        req.setPassword("Passw0rd!");

        when(users.findByUsername("edwin"))
                .thenReturn(Optional.of(user("edwin", "edwin@example.com", "$2a$...", true)));
        when(encoder.matches("Passw0rd!", "$2a$...")).thenReturn(true);
        when(jwt.generateAccessToken(eq("edwin"), eq("edwin@example.com"), anyList())).thenReturn("ey.access");

        AuthResponse out = svc.authenticate(req);

        assertThat(out.getToken()).isEqualTo("ey.access");
        verify(jwt).generateAccessToken(eq("edwin"), eq("edwin@example.com"), anyList());
    }

    @Test
    void authenticate_throwsOnBadPassword() {
        var req = new AuthRequest();
        req.setUsername("edwin");
        req.setPassword("bad");

        when(users.findByUsername("edwin")).thenReturn(Optional.of(user("edwin", "e@e.com", "$2a$...", true)));
        when(encoder.matches("bad", "$2a$...")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> svc.authenticate(req));
    }

    @Test
    void authenticate_throwsWhenUnverified() {
        var req = new AuthRequest();
        req.setUsername("edwin");
        req.setPassword("Passw0rd!");

        when(users.findByUsername("edwin")).thenReturn(Optional.of(user("edwin", "e@e.com", "$2a$...", false)));
        when(encoder.matches("Passw0rd!", "$2a$...")).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> svc.authenticate(req));
    }

    @Test
    void authenticate_throwsWhenUserNotFound() {
        var req = new AuthRequest();
        req.setUsername("nobody");
        req.setPassword("x");

        when(users.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> svc.authenticate(req));
    }
}
