package com.sketchsync.core.controller;

import com.sketchsync.core.config.SecurityConfig;
import com.sketchsync.core.security.JwtAuthenticationFilter;
import com.sketchsync.core.service.CanvasSnapshotService;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = CanvasController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthenticationFilter.class, SecurityConfig.class}
        )
)
@Import(CanvasControllerTest.TestSecurityConfig.class)
class CanvasControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @MockitoBean
    private CanvasSnapshotService canvasSnapshotService;

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
    void saveSnapshot_shouldSaveSnapshot() throws Exception {

        JsonNode data = jsonMapper.readTree("""
                {
                    "objects": [
                        {
                            "type": "rectangle",
                            "x": 100,
                            "y": 200
                        }
                    ]
                }
                """);

        when(canvasSnapshotService.saveSnapshot(
                eq(1L),
                eq("user-123"),
                any(JsonNode.class)
        )).thenReturn(data);

        mockMvc.perform(
                        post("/api/canvas/1")
                                .with(user("user-123"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "data": {
                                                "objects": [
                                                    {
                                                        "type": "rectangle",
                                                        "x": 100,
                                                        "y": 200
                                                    }
                                                ]
                                            }
                                        }
                                        """)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(1))
                .andExpect(jsonPath("$.data.objects[0].type").value("rectangle"))
                .andExpect(jsonPath("$.data.objects[0].x").value(100))
                .andExpect(jsonPath("$.data.objects[0].y").value(200));

        verify(canvasSnapshotService).saveSnapshot(
                eq(1L),
                eq("user-123"),
                any(JsonNode.class)
        );
    }

    @Test
    void getSnapshot_shouldReturnSnapshot() throws Exception {

        JsonNode data = jsonMapper.readTree("""
                {
                    "objects": [
                        {
                            "type": "circle",
                            "x": 50,
                            "y": 75
                        }
                    ]
                }
                """);

        when(canvasSnapshotService.getSnapshot(
                1L,
                "user-123"
        )).thenReturn(data);

        mockMvc.perform(
                        get("/api/canvas/1")
                                .with(user("user-123"))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value(1))
                .andExpect(jsonPath("$.data.objects[0].type").value("circle"))
                .andExpect(jsonPath("$.data.objects[0].x").value(50))
                .andExpect(jsonPath("$.data.objects[0].y").value(75));

        verify(canvasSnapshotService).getSnapshot(
                1L,
                "user-123"
        );
    }

    @Test
    void saveSnapshot_withoutAuthentication_shouldBeUnauthorized() throws Exception {

        mockMvc.perform(
                        post("/api/canvas/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                            "data": {
                                                "objects": []
                                            }
                                        }
                                        """)
                )
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(canvasSnapshotService);
    }

    @Test
    void getSnapshot_withoutAuthentication_shouldBeUnauthorized() throws Exception {

        mockMvc.perform(
                        get("/api/canvas/1")
                )
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(canvasSnapshotService);
    }

    @Test
    void saveSnapshot_withoutData_shouldReturnBadRequest() throws Exception {

        mockMvc.perform(
                        post("/api/canvas/1")
                                .with(user("user-123"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {}
                                        """)
                )
                .andExpect(status().isBadRequest());

        verifyNoInteractions(canvasSnapshotService);
    }
}