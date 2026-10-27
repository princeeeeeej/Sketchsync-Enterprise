package com.sketchsync.core.controller;

import com.sketchsync.core.dto.auth.AuthResponse;
import com.sketchsync.core.dto.auth.SigninRequest;
import com.sketchsync.core.dto.auth.SignupRequest;
import com.sketchsync.core.entity.User;
import com.sketchsync.core.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        User user = authService.signup(request.email(), request.password(), request.name(), request.photo());
        String token = authService.generateToken(user);
        ResponseCookie cookie = createAuthCookie(token);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(toAuthResponse(user));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@Valid @RequestBody SigninRequest request) {
        User user = authService.authenticate(request.email(), request.password());

        String token = authService.generateToken(user);

        ResponseCookie cookie = createAuthCookie(token);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(toAuthResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {

        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private ResponseCookie createAuthCookie(String token) {
        return ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .build();
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(user.getId(), user.getEmail(), user.getName(), user.getPhoto());
    }

    @GetMapping("/me")
    private AuthResponse me(Authentication authentication) {
        String userId = authentication.getName();
        User user = authService.getUserByUserId(userId);
        return new AuthResponse(userId, user.getEmail(), user.getName(), user.getPhoto());
    }
}