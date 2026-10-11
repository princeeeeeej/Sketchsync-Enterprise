package com.sketchsync.core.dto.room;

import java.time.LocalDateTime;

public record RoomResponse(
        Long id,
        String slug,
        String adminId,
        LocalDateTime createdAt
) {
}