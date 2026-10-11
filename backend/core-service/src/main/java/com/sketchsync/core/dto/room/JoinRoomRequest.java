package com.sketchsync.core.dto.room;

import jakarta.validation.constraints.NotBlank;

public record JoinRoomRequest(

        @NotBlank
        String slug
) {
}