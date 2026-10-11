package com.sketchsync.core.controller;

import com.sketchsync.core.config.SecurityConfig;
import com.sketchsync.core.entity.Room;
import com.sketchsync.core.security.JwtAuthenticationFilter;
import com.sketchsync.core.service.RoomService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = RoomController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthenticationFilter.class, SecurityConfig.class}
        )
)
@Import(RoomControllerTest.TestSecurityConfig.class)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RoomService roomService;

    @TestConfiguration
    static class TestSecurityConfig {

        @Bean
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf.disable())
                    .exceptionHandling(e -> e.authenticationEntryPoint(
                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(
                                    "/api/auth/signup",
                                    "/api/auth/signin",
                                    "/api/auth/logout"
                            ).permitAll()
                            .anyRequest().authenticated()
                    );

            return http.build();
        }
    }

    @Test
    void createRoom_shouldCreateRoom() throws Exception {

        Room room = new Room();
        room.setId(1L);
        room.setSlug("test-room");

        when(roomService.createRoom(
                "test-room",
                "user-123"
        )).thenReturn(room);

        mockMvc.perform(
                        post("/api/rooms")
                                .with(user("user-123"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "slug": "test-room"
                                        }
                                        """)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.slug").value("test-room"));

        verify(roomService).createRoom(
                "test-room",
                "user-123"
        );
    }

    @Test
    void joinRoom_shouldJoinRoom() throws Exception {

        Room room = new Room();
        room.setId(1L);
        room.setSlug("test-room");

        when(roomService.joinRoom(
                "test-room",
                "user-123"
        )).thenReturn(room);

        mockMvc.perform(
                        post("/api/rooms/join")
                                .with(user("user-123"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "slug": "test-room"
                                        }
                                        """)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.slug").value("test-room"));

        verify(roomService).joinRoom(
                "test-room",
                "user-123"
        );
    }

    @Test
    void getRoom_shouldReturnRoom() throws Exception {

        Room room = new Room();
        room.setId(1L);
        room.setSlug("test-room");

        when(roomService.getRoomForUser(
                1L,
                "user-123"
        )).thenReturn(room);

        mockMvc.perform(
                        get("/api/rooms/1")
                                .with(user("user-123"))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.slug").value("test-room"));

        verify(roomService).getRoomForUser(
                1L,
                "user-123"
        );
    }

    @Test
    void createRoom_withoutAuthentication_shouldBeUnauthorized() throws Exception {

        mockMvc.perform(
                        post("/api/rooms")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "slug": "test-room"
                                        }
                                        """)
                )
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(roomService);
    }

    @Test
    void getRoom_withoutAuthentication_shouldBeUnauthorized() throws Exception {

        mockMvc.perform(
                        get("/api/rooms/1")
                )
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(roomService);
    }
}