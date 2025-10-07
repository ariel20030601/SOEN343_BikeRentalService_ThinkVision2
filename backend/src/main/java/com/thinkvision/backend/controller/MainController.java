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

    @PostMapping(path = "/add")
    public @ResponseBody String addNewUser(@RequestParam String first_name,
                                           @RequestParam String last_name,
                                           @RequestParam String email,
                                           @RequestParam String username,
                                           @RequestParam String password
    ) {

        User n = new User();
        n.setFirstName(first_name);
        n.setLastName(last_name);
        n.setEmail(email);
        n.setUsername(username);
        n.setPasswordHash(passwordEncoder.encode(password));
        n.setRole("USER");
        userRepository.save(n);
        return "Saved";
    }

    @GetMapping(path = "/all")
    public @ResponseBody Iterable<User> getAllUsers(){
        return userRepository.findAll();
    }

}
