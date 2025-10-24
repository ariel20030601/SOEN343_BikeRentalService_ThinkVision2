package com.thinkvision.backend.applicationLayer;
import com.thinkvision.backend.applicationLayer.RegisterRequest;
import com.thinkvision.backend.applicationLayer.UsernameAlreadyExistsException;
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
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setUsername(req.getUsername());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole("RIDER");
        user.setAddress(req.getAddress());
        user.setPaymentInfo(req.getPaymentInfo());
        userRepository.save(user);
    }

    public Optional<User> authenticate(LoginRequest req) {
        return userRepository.findByUsername(req.getUsername())
                .filter(u -> passwordEncoder.matches(req.getPassword(), u.getPasswordHash()));
    }
}
