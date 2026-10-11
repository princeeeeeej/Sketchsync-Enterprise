package com.sketchsync.core.service;

import com.sketchsync.core.entity.Room;
import com.sketchsync.core.entity.RoomMember;
import com.sketchsync.core.entity.User;
import com.sketchsync.core.exception.ForbiddenException;
import com.sketchsync.core.repository.RoomMemberRepository;
import com.sketchsync.core.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserService userService;

    public RoomService(RoomRepository roomRepository, RoomMemberRepository roomMemberRepository, UserService userService) {
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
        this.userService = userService;
    }

    @Transactional
    public Room createRoom(String slug, String userId) {

        if (roomRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Room already exists");
        }

        User admin = userService.findById(userId);

        Room room = new Room();
        room.setSlug(slug);
        room.setAdmin(admin);

        Room savedRoom = roomRepository.save(room);

        RoomMember member = new RoomMember();
        member.setRoom(savedRoom);
        member.setUser(admin);

        roomMemberRepository.save(member);

        return savedRoom;
    }

    @Transactional
    public Room joinRoom(String slug, String userId) {

        Room room = roomRepository.findBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Room not found"));

        User user = userService.findById(userId);

        if (roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            throw new ForbiddenException(
                    "User already belongs to this room"
            );
        }

        RoomMember member = new RoomMember();
        member.setRoom(room);
        member.setUser(user);

        roomMemberRepository.save(member);

        return room;
    }

    @Transactional(readOnly = true)
    public Room findById(Long roomId) {

        return roomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("Room not found"));
    }

    @Transactional(readOnly = true)
    public boolean isMember(Long roomId, String userId) {

        return roomMemberRepository.existsByRoomIdAndUserId(roomId, userId);
    }

    @Transactional(readOnly = true)
    public Room getRoomForUser(Long roomId, String userId) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found"));

        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new IllegalArgumentException(
                    "You are not a member of this room"
            );
        }

        return room;
    }
}