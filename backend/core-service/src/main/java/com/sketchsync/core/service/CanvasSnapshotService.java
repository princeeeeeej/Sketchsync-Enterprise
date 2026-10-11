package com.sketchsync.core.service;

import com.sketchsync.core.entity.CanvasSnapshot;
import com.sketchsync.core.entity.Room;
import com.sketchsync.core.repository.CanvasSnapshotRepository;
import com.sketchsync.core.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class CanvasSnapshotService {

    private final CanvasSnapshotRepository canvasSnapshotRepository;
    private final RoomService roomService;
    private final RoomRepository roomRepository;
    private final JsonMapper jsonMapper;

    public CanvasSnapshotService(CanvasSnapshotRepository canvasSnapshotRepository,
                                 RoomService roomService,
                                 RoomRepository roomRepository,
                                 JsonMapper jsonMapper) {
        this.canvasSnapshotRepository = canvasSnapshotRepository;
        this.roomService = roomService;
        this.roomRepository = roomRepository;
        this.jsonMapper = jsonMapper;
    }

    @Transactional(readOnly = true)
    public JsonNode getSnapshot(Long roomId, String userId) {
        roomService.getRoomForUser(roomId, userId);

        return canvasSnapshotRepository.findByRoomId(roomId)
                .map(s -> jsonMapper.readTree(s.getData()))
                .orElse(null);
    }

    @Transactional
    public JsonNode saveSnapshot(Long roomId, String userId, JsonNode data) {
        Room room = roomService.getRoomForUser(roomId, userId);

        CanvasSnapshot snapshot = canvasSnapshotRepository
                .findByRoomId(roomId)
                .orElseGet(() -> {
                    CanvasSnapshot s = new CanvasSnapshot();
                    s.setRoom(room);
                    return s;
                });

        snapshot.setData(jsonMapper.writeValueAsString(data));
        canvasSnapshotRepository.save(snapshot);

        return data;
    }
}