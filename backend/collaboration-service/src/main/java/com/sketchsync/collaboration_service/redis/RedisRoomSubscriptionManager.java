package com.sketchsync.collaboration_service.redis;

import jakarta.annotation.PreDestroy;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RedisRoomSubscriptionManager {

    private static final String CHANNEL_PREFIX = "sketchsync:room:";

    private final RedisMessageListenerContainer container;
    private final RedisRoomSubscriber subscriber;

    private final Set<Long> subscribedRooms =
            ConcurrentHashMap.newKeySet();

    public RedisRoomSubscriptionManager(RedisMessageListenerContainer container, RedisRoomSubscriber subscriber) {
        this.container = container;
        this.subscriber = subscriber;
    }

    public void subscribe(Long roomId) {

        if (!subscribedRooms.add(roomId)) {
            return;
        }

        container.addMessageListener(subscriber, new ChannelTopic(CHANNEL_PREFIX + roomId));

        System.out.println("Subscribed to Redis room channel: " + roomId);
    }

    public void unsubscribe(Long roomId) {

        if (!subscribedRooms.remove(roomId)) {
            return;
        }

        container.removeMessageListener(subscriber, new ChannelTopic(CHANNEL_PREFIX + roomId));

        System.out.println("Unsubscribed from Redis room channel: " + roomId);
    }

    @PreDestroy
    public void shutdown() {

        System.out.println(
                "Removing Redis room subscriptions..."
        );

        for (Long roomId : subscribedRooms) {

            try {

                container.removeMessageListener(
                        subscriber,
                        new ChannelTopic(
                                CHANNEL_PREFIX + roomId
                        )
                );

            } catch (Exception e) {

                System.err.println(
                        "Failed to unsubscribe room "
                                + roomId
                                + " | error="
                                + e.getMessage()
                );
            }
        }

        subscribedRooms.clear();

        System.out.println(
                "Redis room subscriptions removed"
        );
    }
}