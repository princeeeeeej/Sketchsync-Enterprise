package com.sketchsync.collaboration_service.redis;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

@Service
public class RedisCollaborationService {

    private static final String CHANNEL_PREFIX =
            "sketchsync:room:";

    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;
    private final InstanceIdProvider instanceIdProvider;

    public RedisCollaborationService(
            StringRedisTemplate redisTemplate,
            JsonMapper jsonMapper,
            InstanceIdProvider instanceIdProvider
    ) {
        this.redisTemplate = redisTemplate;
        this.jsonMapper = jsonMapper;
        this.instanceIdProvider = instanceIdProvider;
    }

    public void publish(
            Long roomId,
            String payload
    ) {

        RedisCollaborationEvent event =
                new RedisCollaborationEvent(
                        "collaboration",
                        instanceIdProvider.getInstanceId(),
                        roomId,
                        payload
                );

        try {

            String message =
                    jsonMapper.writeValueAsString(event);

            String channel =
                    CHANNEL_PREFIX + roomId;

            System.out.println(
                    "Publishing Redis event | channel="
                            + channel
                            + " | payload="
                            + payload
            );

            redisTemplate.convertAndSend(
                    channel,
                    message
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to publish collaboration event",
                    e
            );
        }
    }

    public void publishPresence(
            Long roomId,
            String userId,
            String type
    ) {

        RedisPresenceEvent event =
                new RedisPresenceEvent(
                        "presence",
                        instanceIdProvider.getInstanceId(),
                        roomId,
                        userId,
                        type
                );

        try {

            String message =
                    jsonMapper.writeValueAsString(event);

            String channel =
                    CHANNEL_PREFIX + roomId;

            System.out.println(
                    "Publishing presence | type="
                            + type
                            + " | room="
                            + roomId
                            + " | user="
                            + userId
            );

            redisTemplate.convertAndSend(
                    channel,
                    message
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to publish presence event",
                    e
            );
        }
    }
}