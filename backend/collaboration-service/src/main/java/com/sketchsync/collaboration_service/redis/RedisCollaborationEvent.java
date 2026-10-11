package com.sketchsync.collaboration_service.redis;

public record RedisCollaborationEvent(
        String eventType,
        String instanceId,
        Long roomId,
        String payload
) {
}