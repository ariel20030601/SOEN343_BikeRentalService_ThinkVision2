package com.thinkvision.backend.controller;

import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/users")
public class MainController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(path = "/add")
    public @ResponseBody String addNewUser(@RequestParam String name,
                                           @RequestParam String email,
                                           @RequestParam String username,
                                           @RequestParam String password
    ) {

        User n = new User();
        n.setName(name);
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
