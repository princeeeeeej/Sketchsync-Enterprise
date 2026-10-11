package com.sketchsync.core.service;

import com.sketchsync.core.entity.User;
import com.sketchsync.core.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserService userService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public User signup(String email, String password, String name, String photo) {
        return userService.createUser(email, password, name, photo);
    }

    @Transactional(readOnly = true)
    public User authenticate(String email, String password) {
        User user = userService.findByEmail(email);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return user;
    }

    public String generateToken(User user) {
        return jwtService.generateToken(user.getId());
    }
}