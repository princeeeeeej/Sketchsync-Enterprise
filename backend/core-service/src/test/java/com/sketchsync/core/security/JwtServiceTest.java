package com.sketchsync.core.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService("this-is-a-development-secret-key-that-is-at-least-32-bytes-long", 3600000);

    @Test
    void shouldGenerateAndValidateToken() {

        String userId = "user-123";

        String token = jwtService.generateToken(userId);

        assertNotNull(token);
        assertTrue(jwtService.isValid(token));
    }

    @Test
    void shouldExtractUserIdFromToken() {

        String userId = "user-123";

        String token = jwtService.generateToken(userId);

        assertEquals(userId, jwtService.extractUserId(token));
    }

    @Test
    void shouldRejectInvalidToken() {

        assertFalse(jwtService.isValid("invalid.jwt.token"));
    }
}