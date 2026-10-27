package com.sketchsync.collaboration_service.redis;

import com.sketchsync.collaboration_service.websocket.RoomSessionManager;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;

@Component
public class RedisRoomSubscriber implements MessageListener {

    private final RoomSessionManager roomSessionManager;
    private final JsonMapper jsonMapper;
    private final InstanceIdProvider instanceIdProvider;

    public RedisRoomSubscriber(
            RoomSessionManager roomSessionManager,
            JsonMapper jsonMapper,
            InstanceIdProvider instanceIdProvider
    ) {
        this.roomSessionManager = roomSessionManager;
        this.jsonMapper = jsonMapper;
        this.instanceIdProvider = instanceIdProvider;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {

        String payload = new String(message.getBody(), StandardCharsets.UTF_8);

        try {
            JsonNode root = jsonMapper.readTree(payload);
            String eventType = root.path("eventType").asText();
            String instanceId = root.path("instanceId").asText();
            Long roomId = root.path("roomId").asLong();

            if (instanceIdProvider.getInstanceId().equals(instanceId)) {
                return;
            }

            if ("collaboration".equals(eventType)) {
                RedisCollaborationEvent event = jsonMapper.readValue(payload, RedisCollaborationEvent.class);

                roomSessionManager.broadcastToRoom(
                        event.roomId(),
                        event.payload()
                );

                return;
            }

            if ("presence".equals(eventType)) {
                RedisPresenceEvent event = jsonMapper.readValue(payload, RedisPresenceEvent.class);

                String presenceMessage = """
                        {
                            "type": "%s",
                            "userId": "%s"
                        }
                        """.formatted(
                        event.type(),
                        event.userId()
                );

                roomSessionManager.broadcastToRoom(roomId, presenceMessage);
            }

        } catch (Exception e) {
            System.err.println("Failed to process Redis event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}