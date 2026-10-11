package com.sketchsync.core.repository;

import com.sketchsync.core.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {

    boolean existsByRoomIdAndUserId(Long roomId, String userId);

    Optional<RoomMember> findByRoomIdAndUserId(Long roomId, String userId);
}