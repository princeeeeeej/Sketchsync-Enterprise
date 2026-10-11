package com.sketchsync.core.dto.canvas;

import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.JsonNode;

public record SaveCanvasRequest(@NotNull(message = "Canvas data is required") JsonNode data) {
}