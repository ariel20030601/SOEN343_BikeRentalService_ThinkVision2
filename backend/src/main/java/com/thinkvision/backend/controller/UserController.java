package com.thinkvision.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication authentication) {
        // authentication.getName() is the username from the token
        return ResponseEntity.ok(java.util.Map.of("username", authentication.getName()));
    }
}
