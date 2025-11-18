package com.thinkvision.backend.controller;

import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.UserRepository;
import com.thinkvision.backend.applicationLayer.AuthenticationService;
import com.thinkvision.backend.security.JwtUtils;
import com.thinkvision.backend.applicationLayer.RegisterRequest;
import com.thinkvision.backend.applicationLayer.LoginRequest;
import com.thinkvision.backend.applicationLayer.AuthResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:8081") // allow requests from frontend
public class MainController {

    private final AuthenticationService authService;
    private final JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public MainController(AuthenticationService authService, JwtUtils jwtUtils) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        authService.register(req);
        User user = userRepository.findByUsername(req.getUsername()).orElse(null);
        return ResponseEntity.status(201).body(user);
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(java.util.Map.of("available", !exists));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        var userOpt = authService.authenticate(req);
        if (userOpt.isPresent()) {
            var user = userOpt.get();
            var token = jwtUtils.generateToken(user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user));
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @GetMapping(path = "/all")
    public @ResponseBody Iterable<User> getAllUsers(){
        return userRepository.findAll();
    }

}
