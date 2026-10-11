package com.sketchsync.collaboration_service.websocket;

import com.sketchsync.collaboration_service.client.CoreServiceClient;
import com.sketchsync.collaboration_service.redis.RedisCollaborationService;
import com.sketchsync.collaboration_service.redis.RedisRoomSubscriptionManager;
import com.sketchsync.collaboration_service.snapshot.SnapshotManager;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CollaborationWebSocketHandler
        extends TextWebSocketHandler {

    private final RedisCollaborationService redisCollaborationService;
    private final RoomSessionManager roomSessionManager;
    private final JsonMapper jsonMapper;
    private final CoreServiceClient coreServiceClient;
    private final RedisRoomSubscriptionManager redisRoomSubscriptionManager;
    private final SnapshotManager snapshotManager;
    private final WebSocketHeartbeatManager heartbeatManager;

    public CollaborationWebSocketHandler(
            RoomSessionManager roomSessionManager,
            CoreServiceClient coreServiceClient,
            JsonMapper jsonMapper,
            RedisCollaborationService redisCollaborationService,
            RedisRoomSubscriptionManager redisRoomSubscriptionManager,
            SnapshotManager snapshotManager,
            WebSocketHeartbeatManager heartbeatManager
    ) {
        this.roomSessionManager = roomSessionManager;
        this.coreServiceClient = coreServiceClient;
        this.jsonMapper = jsonMapper;
        this.redisCollaborationService = redisCollaborationService;
        this.redisRoomSubscriptionManager = redisRoomSubscriptionManager;
        this.snapshotManager = snapshotManager;
        this.heartbeatManager = heartbeatManager;
    }

    @Override
    public void afterConnectionEstablished(
            WebSocketSession session
    ) throws Exception {

        System.out.println(
                "WebSocket connected: " + session.getId()
        );

        session.sendMessage(
                new TextMessage("""
                    {
                        "type": "connected",
                        "message": "Connected to SketchSync collaboration service"
                    }
                    """)
        );

        heartbeatManager.register(session);
    }

    @Override
    protected void handleTextMessage(
            WebSocketSession session,
            TextMessage message
    ) throws Exception {

        String payload = message.getPayload();

        System.out.println(
                "Received [" + session.getId() + "]: " + payload
        );

        JsonNode root;

        try {
            root = jsonMapper.readTree(payload);
        } catch (Exception e) {
            sendError(session, "Invalid JSON");
            return;
        }

        String type = root.path("type").asText(null);

        if (type == null || type.isBlank()) {
            sendError(session, "Message type is required");
            return;
        }

        switch (type) {

            case "join_room" -> handleJoinRoom(
                    session,
                    root
            );

            case "leave_room" -> handleLeaveRoom(
                    session,
                    root
            );

            /*
             * Save must be handled separately because it
             * persists the canvas snapshot.
             */
            case "save" -> handleSaveSnapshot(
                    session,
                    root
            );

            /*
             * Normal realtime collaboration events.
             */
            case "draw",
                 "cursor",
                 "preview",
                 "erase",
                 "clear_preview" -> handleCollaborationMessage(
                    session,
                    root,
                    payload
            );

            default -> sendError(
                    session,
                    "Unknown message type"
            );
        }
    }

    /**
     * Handles joining a room.
     *
     * Flow:
     *
     * 1. Extract roomId
     * 2. Get JWT from WebSocket session
     * 3. Ask core-service whether user is a member
     * 4. Remove user from previous room if necessary
     * 5. Add user to local room
     * 6. Subscribe this service instance to Redis room channel
     * 7. Notify existing users
     * 8. Send room state to joining user
     */
    private void handleJoinRoom(
            WebSocketSession session,
            JsonNode root
    ) throws Exception {

        Long roomId = extractRoomId(root);

        if (roomId == null) {
            sendError(
                    session,
                    "roomId is required"
            );
            return;
        }

        String accessToken =
                (String) session.getAttributes()
                        .get("accessToken");

        if (accessToken == null) {
            sendError(
                    session,
                    "Authentication required"
            );
            return;
        }

        /*
         * Ask core-service whether the authenticated
         * user belongs to this room.
         */
        boolean member;

        try {

            member = coreServiceClient.isMember(
                    roomId,
                    accessToken
            );

        } catch (Exception e) {

            System.err.println(
                    "Failed to verify room membership: "
                            + e.getMessage()
            );

            sendError(
                    session,
                    "Unable to verify room membership"
            );

            return;
        }

        if (!member) {

            sendError(
                    session,
                    "You are not a member of this room"
            );

            return;
        }

        /*
         * If this session was already inside another room,
         * remove it from that room first.
         */
        Long previousRoomId =
                (Long) session.getAttributes()
                        .get("roomId");

        if (previousRoomId != null) {

            String userId =
                    (String) session.getAttributes()
                            .get("userId");

            roomSessionManager.leaveRoom(
                    previousRoomId,
                    session
            );

            roomSessionManager.broadcastToRoom(
                    previousRoomId,
                    """
                    {
                        "type": "user_left",
                        "userId": "%s"
                    }
                    """.formatted(userId)
            );

            /*
             * If this was the last local user in the
             * previous room, unsubscribe from Redis.
             */
            if (roomSessionManager.isRoomEmpty(
                    previousRoomId
            )) {

                redisRoomSubscriptionManager.unsubscribe(
                        previousRoomId
                );
            }
        }

        /*
         * Check whether this is the first local user
         * in this room before adding the session.
         */
        boolean firstLocalUser =
                roomSessionManager.isRoomEmpty(roomId);

        /*
         * Add session to local room.
         */
        roomSessionManager.joinRoom(
                roomId,
                session
        );

        session.getAttributes().put(
                "roomId",
                roomId
        );

        /*
         * First local user means this JVM needs to
         * subscribe to the Redis channel for this room.
         */
        if (firstLocalUser) {

            redisRoomSubscriptionManager.subscribe(
                    roomId
            );
        }

        String userId =
                (String) session.getAttributes()
                        .get("userId");

        /*
         * Notify all existing local users that
         * someone joined.
         */
        roomSessionManager.broadcast(
                roomId,
                session,
                """
                {
                    "type": "user_joined",
                    "userId": "%s"
                }
                """.formatted(userId)
        );

        /*
         * Get the current users connected to this
         * collaboration-service instance.
         */
        List<String> userIds =
                roomSessionManager.getUserIds(roomId);

        String usersJson =
                userIds.stream()
                        .map(id -> "\"" + id + "\"")
                        .collect(
                                Collectors.joining(",")
                        );

        /*
         * Send current room state to the newly joined user.
         */
        session.sendMessage(
                new TextMessage(
                        """
                        {
                            "type": "room_joined",
                            "roomId": %d,
                            "users": [%s]
                        }
                        """.formatted(
                                roomId,
                                usersJson
                        )
                )
        );

        redisCollaborationService.publishPresence(
                roomId,
                userId,
                "user_joined"
        );

        /*
         * Load the last persisted canvas snapshot.
         */
        sendCanvasSnapshot(
                session,
                roomId
        );

        System.out.println(
                "User "
                        + userId
                        + " joined room "
                        + roomId
        );
    }

    private void handleLeaveRoom(
            WebSocketSession session,
            JsonNode root
    ) throws Exception {

        Long roomId = extractRoomId(root);

        if (roomId == null) {
            roomId = (Long) session.getAttributes()
                    .get("roomId");
        }

        if (roomId == null) {

            sendError(
                    session,
                    "Not currently in a room"
            );

            return;
        }

        cleanupSession(session);

        session.sendMessage(
                new TextMessage(
                        """
                        {
                            "type": "room_left",
                            "roomId": %d
                        }
                        """.formatted(roomId)
                )
        );

        System.out.println(
                "User explicitly left room | user="
                        + session.getAttributes()
                        .get("userId")
                        + " | room="
                        + roomId
        );
    }

    /**
     * Handles realtime collaboration events.
     *
     * These events are:
     *
     * draw
     * cursor
     * preview
     * erase
     * clear_preview
     *
     * They are broadcast locally and published to Redis
     * for other collaboration-service instances.
     */
    private void handleCollaborationMessage(
            WebSocketSession session,
            JsonNode root,
            String originalPayload
    ) throws Exception {

        Long roomId =
                (Long) session.getAttributes().get("roomId");

        if (roomId == null) {

            sendError(
                    session,
                    "Join a room before sending collaboration events"
            );

            return;
        }

        Long messageRoomId =
                extractRoomId(root);

        if (messageRoomId != null
                && !roomId.equals(messageRoomId)) {

            sendError(
                    session,
                    "Message roomId does not match joined room"
            );

            return;
        }

        System.out.println(
                "Broadcasting locally | room="
                        + roomId
                        + " | sender="
                        + session.getId()
        );

        /*
         * 1. Send to other users connected to this instance.
         */
        roomSessionManager.broadcast(
                roomId,
                session,
                originalPayload
        );

        System.out.println(
                "Publishing to Redis | room="
                        + roomId
        );

        /*
         * 2. Send to other collaboration-service instances.
         */
        redisCollaborationService.publish(
                roomId,
                originalPayload
        );
    }

    /**
     * Handles canvas snapshot persistence.
     *
     * The save message does NOT go through the normal
     * collaboration-event path.
     *
     * Instead:
     *
     * WebSocket
     *      ↓
     * SnapshotManager
     *      ↓
     * debounce 5 sec
     *      ↓
     * Core Service
     *      ↓
     * PostgreSQL
     */
    private void handleSaveSnapshot(
            WebSocketSession session,
            JsonNode root
    ) throws Exception {

        Long roomId =
                (Long) session.getAttributes()
                        .get("roomId");

        if (roomId == null) {

            sendError(
                    session,
                    "Join a room before saving canvas"
            );

            return;
        }

        Long messageRoomId = extractRoomId(root);

        if (messageRoomId != null
                && !roomId.equals(messageRoomId)) {

            sendError(
                    session,
                    "Message roomId does not match joined room"
            );

            return;
        }

        JsonNode data = root.get("data");

        if (data == null || data.isNull()) {

            sendError(
                    session,
                    "Canvas data is required"
            );

            return;
        }

        String accessToken =
                (String) session
                        .getAttributes()
                        .get("accessToken");

        if (accessToken == null) {

            sendError(
                    session,
                    "Authentication required"
            );

            return;
        }

        System.out.println(
                "Saving canvas snapshot | room="
                        + roomId
        );

        snapshotManager.updateSnapshot(
                roomId,
                data,
                accessToken
        );

        /*
         * Notify other connected users that a save event
         * occurred.
         *
         * The actual persistence is handled above by
         * SnapshotManager.
         */
        roomSessionManager.broadcast(
                roomId,
                session,
                root.toString()
        );

        redisCollaborationService.publish(
                roomId,
                root.toString()
        );

        System.out.println(
                "Canvas snapshot queued | room="
                        + roomId
        );
    }

    private Long extractRoomId(
            JsonNode root
    ) {

        JsonNode roomIdNode =
                root.get("roomId");

        if (roomIdNode == null
                || roomIdNode.isNull()) {

            return null;
        }

        if (!roomIdNode.isNumber()) {
            return null;
        }

        return roomIdNode.asLong();
    }

    private void sendError(
            WebSocketSession session,
            String message
    ) throws Exception {

        String escapedMessage =
                message.replace("\"", "\\\"");

        session.sendMessage(
                new TextMessage(
                        """
                        {
                            "type": "error",
                            "message": "%s"
                        }
                        """.formatted(escapedMessage)
                )
        );
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status
    ) throws Exception {

        heartbeatManager.unregister(session);

        cleanupSession(session);

        System.out.println(
                "WebSocket closed | session="
                        + session.getId()
                        + " | status="
                        + status.getCode()
        );
    }

    private void sendCanvasSnapshot(
            WebSocketSession session,
            Long roomId
    ) {

        try {

            String accessToken =
                    (String) session.getAttributes()
                            .get("accessToken");

            JsonNode snapshot =
                    coreServiceClient.getSnapshot(
                            roomId,
                            accessToken
                    );

            if (snapshot == null || snapshot.isNull()) {

                System.out.println(
                        "No canvas snapshot found | room="
                                + roomId
                );

                return;
            }

            ObjectNode message =
                    jsonMapper.createObjectNode();

            message.put(
                    "type",
                    "canvas_state"
            );

            message.put(
                    "roomId",
                    roomId
            );

            message.set(
                    "data",
                    snapshot
            );

            session.sendMessage(
                    new TextMessage(
                            message.toString()
                    )
            );

            System.out.println(
                    "Canvas snapshot sent | room="
                            + roomId
            );

        } catch (Exception e) {

            System.err.println(
                    "Failed to load canvas snapshot | room="
                            + roomId
                            + " | error="
                            + e.getMessage()
            );
        }
    }

    private void cleanupSession(
            WebSocketSession session
    ) {

        String userId =
                (String) session.getAttributes()
                        .get("userId");

        Long roomId =
                (Long) session.getAttributes()
                        .get("roomId");

        if (roomId == null) {
            return;
        }

        /*
         * Remove this exact WebSocket session.
         */
        roomSessionManager.leaveRoom(
                roomId,
                session
        );

        /*
         * Check whether the same user still has
         * another WebSocket connection in this room.
         */
        boolean stillConnected =
                userId != null
                        && roomSessionManager.hasUser(
                        roomId,
                        userId
                );

        /*
         * Only announce user_left when this was
         * the user's last connection on this instance.
         */
        if (!stillConnected && userId != null) {

            String userLeftMessage = """
                {
                    "type": "user_left",
                    "userId": "%s"
                }
                """.formatted(userId);

            /*
             * Users on this collaboration instance.
             */
            roomSessionManager.broadcastToRoom(
                    roomId,
                    userLeftMessage
            );

            /*
             * Users connected to other collaboration
             * service instances.
             */
            redisCollaborationService.publishPresence(
                    roomId,
                    userId,
                    "user_left"
            );
        }

        /*
         * No local users → no need to listen to Redis
         * for this room on this instance.
         */
        if (roomSessionManager.isRoomEmpty(roomId)) {

            redisRoomSubscriptionManager.unsubscribe(
                    roomId
            );
        }

        session.getAttributes().remove("roomId");

        System.out.println(
                "Session cleanup | session="
                        + session.getId()
                        + " | user="
                        + userId
                        + " | room="
                        + roomId
                        + " | stillConnected="
                        + stillConnected
        );
    }
}