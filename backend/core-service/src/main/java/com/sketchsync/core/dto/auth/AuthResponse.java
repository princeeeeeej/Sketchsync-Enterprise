package com.sketchsync.core.dto.auth;

public record AuthResponse(
        String id,
        String email,
        String name,
        String photo
) {
}