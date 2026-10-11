package com.sketchsync.collaboration_service.redis;

public record RedisPresenceEvent(
        String eventType,
        String instanceId,
        Long roomId,
        String userId,
        String type
) {
}