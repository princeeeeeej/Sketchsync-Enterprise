package com.sketchsync.core.repository;

import com.sketchsync.core.entity.CanvasSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CanvasSnapshotRepository
        extends JpaRepository<CanvasSnapshot, Long> {

    Optional<CanvasSnapshot> findByRoomId(Long roomId);
}