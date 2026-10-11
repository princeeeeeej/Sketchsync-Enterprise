package com.sketchsync.core.service;

import com.sketchsync.core.entity.User;
import com.sketchsync.core.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUser() {

        String email = "test@gmail.com";
        String password = "password123";
        String name = "Prince";
        String photo = "";

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("hashed-password");

        User savedUser = new User();
        savedUser.setEmail(email);
        savedUser.setPassword("hashed-password");
        savedUser.setName(name);
        savedUser.setPhoto(photo);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.createUser(email, password, name, photo);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals(name, result.getName());
        assertEquals("hashed-password", result.getPassword());

        verify(userRepository).existsByEmail(email);
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldRejectDuplicateEmail() {

        String email = "test@gmail.com";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> userService.createUser(
                        email,
                        "password123",
                        "Prince",
                        ""
                )
        );

        assertEquals("Email already registered", exception.getMessage());

        verify(userRepository).existsByEmail(email);
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void shouldFindUserByEmail() {

        String email = "test@gmail.com";

        User user = new User();
        user.setEmail(email);
        user.setName("Prince");

        when(userRepository.findByEmail(email))
                .thenReturn(Optional.of(user));

        User result = userService.findByEmail(email);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals("Prince", result.getName());

        verify(userRepository).findByEmail(email);
    }

    @Test
    void shouldThrowWhenUserEmailDoesNotExist() {

        String email = "unknown@gmail.com";

        when(userRepository.findByEmail(email))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.findByEmail(email)
        );

        assertEquals(
                "Invalid email or password",
                exception.getMessage()
        );

        verify(userRepository).findByEmail(email);
    }

    @Test
    void shouldFindUserById() {

        String userId = "user-123";

        User user = new User();
        user.setId(userId);
        user.setEmail("test@gmail.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = userService.findById(userId);

        assertNotNull(result);
        assertEquals(userId, result.getId());

        verify(userRepository).findById(userId);
    }

    @Test
    void shouldThrowWhenUserIdDoesNotExist() {

        String userId = "unknown-user";

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.findById(userId)
        );

        assertEquals("User not found", exception.getMessage());

        verify(userRepository).findById(userId);
    }
}