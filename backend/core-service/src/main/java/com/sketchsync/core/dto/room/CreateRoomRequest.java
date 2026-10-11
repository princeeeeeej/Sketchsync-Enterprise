package com.sketchsync.core.dto.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(

        @NotBlank
        @Size(max = 255)
        String slug
) {
}