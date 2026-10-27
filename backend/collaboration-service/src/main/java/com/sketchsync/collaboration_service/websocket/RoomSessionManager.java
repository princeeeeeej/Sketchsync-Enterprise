package com.sketchsync.collaboration_service.websocket;

import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomSessionManager {

    private final ConcurrentHashMap<Long, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    public void joinRoom(Long roomId, WebSocketSession session) {
        rooms.computeIfAbsent(roomId, id -> ConcurrentHashMap.newKeySet()).add(session);
    }

    public void leaveRoom(Long roomId, WebSocketSession session) {

        Set<WebSocketSession> sessions = rooms.get(roomId);

        if (sessions == null) {
            return;
        }

        sessions.remove(session);

        if (sessions.isEmpty()) {
            rooms.remove(roomId, sessions);
        }
    }

    public boolean isRoomEmpty(Long roomId) {

        Set<WebSocketSession> sessions = rooms.get(roomId);

        return sessions == null || sessions.isEmpty();
    }

    public void broadcast(Long roomId, WebSocketSession sender, String message) {

        Set<WebSocketSession> sessions = rooms.get(roomId);
        if (sessions == null) {
            return;
        }

        for (WebSocketSession session : sessions) {
            if (session.getId().equals(sender.getId())) {
                continue;
            }

            send(session, message);
        }
    }

    public void broadcastToRoom(Long roomId, String message) {
        Set<WebSocketSession> sessions = rooms.get(roomId);
        if (sessions == null) {
            return;
        }

        for (WebSocketSession session : sessions) {
            send(session, message);
        }
    }

    public List<String> getUserIds(Long roomId) {

        Set<WebSocketSession> sessions = rooms.get(roomId);

        if (sessions == null) {
            return List.of();
        }

        List<String> userIds = new ArrayList<>();

        for (WebSocketSession session : sessions) {

            String userId = (String) session.getAttributes().get("userId");

            if (userId != null) {
                userIds.add(userId);
            }
        }

        return userIds;
    }

    public boolean hasUser(Long roomId, String userId) {

        Set<WebSocketSession> sessions = rooms.get(roomId);

        if (sessions == null) {
            return false;
        }

        for (WebSocketSession session : sessions) {
            String sessionUserId = (String) session.getAttributes().get("userId");
            if (userId.equals(sessionUserId)) {
                return true;
            }
        }

        return false;
    }

    private void send(WebSocketSession session, String message) {
        if (!session.isOpen()) {
            return;
        }

        try {
            session.sendMessage(new TextMessage(message));

        } catch (Exception e) {
            System.err.println("Failed to send WebSocket message | session=" + session.getId());
        }
    }

    @PreDestroy
    public void shutdown() {

        System.out.println("Closing WebSocket sessions...");

        for (Set<WebSocketSession> sessions : rooms.values()) {
            for (WebSocketSession session : sessions) {

                try {
                    if (session.isOpen()) {
                        session.close();
                    }

                } catch (Exception e) {
                    System.err.println("Failed to close WebSocket session | session=" + session.getId());
                }
            }
        }

        rooms.clear();
        System.out.println("WebSocket sessions closed");
    }
}