package com.sketchsync.core.controller;

import com.sketchsync.core.dto.canvas.CanvasSnapshotResponse;
import com.sketchsync.core.dto.canvas.SaveCanvasRequest;
import com.sketchsync.core.service.CanvasSnapshotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/canvas")
public class CanvasController {

    private final CanvasSnapshotService canvasSnapshotService;

    public CanvasController(CanvasSnapshotService canvasSnapshotService) {
        this.canvasSnapshotService = canvasSnapshotService;
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<CanvasSnapshotResponse> getSnapshot(@PathVariable Long roomId, Authentication authentication) {

        String userId = authentication.getName();

        var data = canvasSnapshotService.getSnapshot(roomId, userId);

        return ResponseEntity.ok(new CanvasSnapshotResponse(roomId, data));
    }

    @PostMapping("/{roomId}")
    public ResponseEntity<CanvasSnapshotResponse> saveSnapshot(
            @PathVariable Long roomId,
            @Valid @RequestBody SaveCanvasRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        var data = canvasSnapshotService.saveSnapshot(
                roomId,
                userId,
                request.data()
        );

        return ResponseEntity.ok(
                new CanvasSnapshotResponse(roomId, data)
        );
    }
}