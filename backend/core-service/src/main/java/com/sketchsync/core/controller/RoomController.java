package com.sketchsync.core.controller;

import com.sketchsync.core.dto.room.CreateRoomRequest;
import com.sketchsync.core.dto.room.JoinRoomRequest;
import com.sketchsync.core.dto.room.RoomResponse;
import com.sketchsync.core.entity.Room;
import com.sketchsync.core.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request, Authentication authentication) {

        String userId = authentication.getName();

        Room room = roomService.createRoom(
                request.slug(),
                userId
        );

        return ResponseEntity.ok(toResponse(room));
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(@Valid @RequestBody JoinRoomRequest request, Authentication authentication) {

        String userId = authentication.getName();

        Room room = roomService.joinRoom(
                request.slug(),
                userId
        );

        return ResponseEntity.ok(toResponse(room));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable Long roomId, Authentication authentication) {

        String userId = authentication.getName();

        Room room = roomService.getRoomForUser(
                roomId,
                userId
        );

        return ResponseEntity.ok(toResponse(room));
    }

    private RoomResponse toResponse(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getSlug(),
                room.getAdmin().getId(),
                room.getCreatedAt()
        );
    }

    @GetMapping("/{roomId}/membership")
    public boolean checkMembership(@PathVariable Long roomId, Authentication authentication) {
        return roomService.isMember(roomId, authentication.getName());
    }
}