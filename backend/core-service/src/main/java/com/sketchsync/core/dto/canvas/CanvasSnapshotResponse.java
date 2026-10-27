package com.sketchsync.core.dto.canvas;

import tools.jackson.databind.JsonNode;

public record CanvasSnapshotResponse(
        Long roomId,
        JsonNode data
) {
}