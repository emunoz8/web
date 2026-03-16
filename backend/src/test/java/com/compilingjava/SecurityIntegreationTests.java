// src/test/java/com/compilingjava/SecurityIntegrationTests.java
package com.compilingjava;

import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.spotify.dto.AddTrackResponse;
import com.compilingjava.spotify.dto.PlaylistViewResponse;
import com.compilingjava.spotify.service.SpotifyArtistService;
import com.compilingjava.spotify.service.SpotifyPlaylistTestingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = { App.class, SecurityIntegrationTests.TestBeans.class }, properties = {
        // let our test bean replace the component-scanned one
        "spring.main.allow-bean-definition-overriding=true"
})
@ActiveProfiles("test") // <- ensure H2 / Flyway-off from application-test.yml
@AutoConfigureMockMvc
class SecurityIntegrationTests {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    SpotifyPlaylistTestingService spotifyPlaylistTestingService;

    @MockitoBean
    SpotifyArtistService spotifyArtistService;

    @TestConfiguration
    static class TestBeans {
        /** Replace the production bean (same name) with a no-op to avoid DB/JWT work. */
        @Bean(name = "emailVerificationService")
        @Primary
        EmailVerificationService emailVerificationService() {
            return new EmailVerificationService(null, null, null, null, null) {
                @Override
                public void resend(String rawEmail) {
                    /* no-op */ }
            };
        }
    }

    @Test
    void resend_is_public_returns_204_for_valid_email() throws Exception {
        mvc.perform(post("/auth/verify/resend")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"you@example.com\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void resend_missing_or_bad_body_returns_400() throws Exception {
        mvc.perform(post("/auth/verify/resend")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/auth/verify/resend")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void spotify_playlist_endpoint_is_public() throws Exception {
        when(spotifyPlaylistTestingService.getConfiguredPlaylist())
                .thenReturn(new PlaylistViewResponse("playlist-1", "Aux", null, 0, List.of()));

        mvc.perform(get("/api/testing/playlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.playlistId").value("playlist-1"));
    }

    @Test
    void spotify_track_search_requires_authentication() throws Exception {
        mvc.perform(get("/api/testing/track-search").param("q", "Muse"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void spotify_add_track_requires_authentication() throws Exception {
        mvc.perform(post("/api/testing/playlist/items")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"uri\":\"spotify:track:track-1\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticated_user_without_csrf_cannot_add_track() throws Exception {
        mvc.perform(post("/api/testing/playlist/items")
                .with(user("listener").roles("USER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"uri\":\"spotify:track:track-1\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void authenticated_user_can_search_tracks() throws Exception {
        when(spotifyPlaylistTestingService.searchTracks("Muse", 10)).thenReturn(List.of());

        mvc.perform(get("/api/testing/track-search")
                .param("q", "Muse")
                .with(user("listener").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks").isArray());
    }

    @Test
    void authenticated_user_can_add_track() throws Exception {
        when(spotifyPlaylistTestingService.addTrackToConfiguredPlaylist("spotify:track:track-1", "listener"))
                .thenReturn(new AddTrackResponse("snapshot-1", "spotify:track:track-1"));

        mvc.perform(post("/api/testing/playlist/items")
                .with(user("listener").roles("USER"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"uri\":\"spotify:track:track-1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.snapshotId").value("snapshot-1"));
    }
}
