package com.thinkvision.backend.applicationLayer;

import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthenticationService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // existsByUsername and findByUsername need to be implemented
    public void register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        String hashed = passwordEncoder.encode(req.getPassword());
        User user = new User(req.getUsername(), hashed, "ROLE_USER");
        userRepository.save(user);
    }

    public Optional<User> authenticate(LoginRequest req) {
        return userRepository.findByUsername(req.getUsername())
                .filter(u -> passwordEncoder.matches(req.getPassword(), u.getPasswordHash()));
    }
}
