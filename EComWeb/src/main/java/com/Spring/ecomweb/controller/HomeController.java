package com.Spring.ecomweb.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.Spring.ecomweb.model.DTO.loginRequest;
import com.Spring.ecomweb.model.DTO.registerRequest;
import com.Spring.ecomweb.model.DTO.UpdateProfileRequest;
import com.Spring.ecomweb.service.homeService;

@RestController
@RequestMapping("/hello")
@CrossOrigin(origins = "http://localhost:5173")
public class HomeController {

    @Autowired
    private homeService service;

    @GetMapping("/greet")
    public String greet() {
        return "welcome Controller";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody loginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody registerRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    // Update profile — JWT filter extracts email from token automatically
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request, Authentication authentication) {
        // authentication.getName() = email extracted from JWT by JwtFilter
        String email = authentication.getName();
        return ResponseEntity.ok(service.updateProfile(email, request));
    }
}