package com.sketchsync.collaboration_service.websocket;

import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class WebSocketHeartbeatManager {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public WebSocketHeartbeatManager() {
        scheduler.scheduleAtFixedRate(
                this::checkConnections,
                30,
                30,
                TimeUnit.SECONDS
        );
    }

    public void register(WebSocketSession session) {
        sessions.put(session.getId(), session);
    }

    public void unregister(WebSocketSession session) {
        sessions.remove(session.getId());
    }

    private void checkConnections() {
        for (WebSocketSession session : sessions.values()) {
            if (!session.isOpen()) {
                sessions.remove(session.getId());
                continue;
            }

            try {
                session.sendMessage(new org.springframework.web.socket.PingMessage());

            }
            catch (Exception e) {
                System.err.println("Heartbeat failed | session=" + session.getId());

                try {
                    session.close();
                }
                catch (Exception ignored) {
                }
                sessions.remove(session.getId());
            }
        }
    }

    @PreDestroy
    public void shutdown() {
        System.out.println("Stopping WebSocket heartbeat...");
        scheduler.shutdown();

        try {

            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }

        }
        catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}