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
import org.springframework.stereotype.Controller;
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
        try {
            authService.register(req);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            System.out.println("WHHAHAHA");
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        var userOpt = authService.authenticate(req);
        if (userOpt.isPresent()) {
            var token = jwtUtils.generateToken(userOpt.get().getUsername());
            return ResponseEntity.ok(new AuthResponse(token));
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @GetMapping(path = "/all")
    public @ResponseBody Iterable<User> getAllUsers(){
        return userRepository.findAll();
    }

}
