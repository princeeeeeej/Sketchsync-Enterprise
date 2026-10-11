package com.sketchsync.collaboration_service.websocket;

import com.sketchsync.collaboration_service.security.JwtService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    public JwtHandshakeInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {

        String cookieHeader = request.getHeaders().getFirst(HttpHeaders.COOKIE);

        if (cookieHeader == null) {
            return false;
        }

        String token = extractAccessToken(cookieHeader);

        if (token == null || !jwtService.isValid(token)) {
            return false;
        }

        String userId = jwtService.extractUserId(token);

        attributes.put("userId", userId);
        attributes.put("accessToken", token);

        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {

    }

    private String extractAccessToken(String cookieHeader) {

        String[] cookies = cookieHeader.split(";");
        for (String cookie : cookies) {
            String[] parts = cookie.trim().split("=", 2);
            if (parts.length == 2 && parts[0].equals("access_token")) {
                return parts[1];
            }
        }

        return null;
    }
}