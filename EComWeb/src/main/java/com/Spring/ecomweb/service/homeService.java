package com.Spring.ecomweb.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.Spring.ecomweb.model.Role;
import com.Spring.ecomweb.model.users;
import com.Spring.ecomweb.model.DTO.UpdateProfileRequest;
import com.Spring.ecomweb.model.DTO.loginRequest;
import com.Spring.ecomweb.model.DTO.registerRequest;
import com.Spring.ecomweb.repository.homeRepo;
import com.Spring.ecomweb.repository.roleRepo;
import com.Spring.ecomweb.security.JwtService;

@Service
public class homeService {

    @Autowired private BCryptPasswordEncoder passwordEncoder;
    @Autowired private homeRepo repo;
    @Autowired private roleRepo rolerepo;
    @Autowired private JwtService jwtService;

    // ── Login ─────────────────────────────────────────────────────────────────
    public Map<String, Object> login(loginRequest request) {
        Optional<users> userOptional = repo.findByEmailOrMobile(
                request.getEmailOrPhone(), request.getEmailOrPhone());

        if (userOptional.isEmpty()) throw new RuntimeException("User not found");

        users user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid password");

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        String token    = jwtService.generateToken(user.getEmail(), roleName);

        Map<String, Object> response = new HashMap<>();
        response.put("message",   "Login Successful");
        response.put("token",     token);
        response.put("role",      roleName);
        response.put("email",     user.getEmail());
        response.put("firstName", user.getFirstname()); // always fresh from DB
        response.put("lastName",  user.getLastname());
        return response;
    }

    // ── Register ──────────────────────────────────────────────────────────────
    public String register(registerRequest request) {
        if (repo.findByEmail(request.getEmail()).isPresent())
            throw new RuntimeException("Email already exists");

        users user = new users();
        user.setFirstname(request.getFirstName());
        user.setLastname(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = rolerepo.findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role);
        repo.save(user);
        return "User Registered Successfully";
    }

    // ── Update Profile ────────────────────────────────────────────────────────
    public Map<String, Object> updateProfile(String email, UpdateProfileRequest request) {
        users user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstName() != null && !request.getFirstName().isBlank())
            user.setFirstname(request.getFirstName());
        if (request.getLastName() != null && !request.getLastName().isBlank())
            user.setLastname(request.getLastName());

        repo.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message",   "Profile updated successfully");
        response.put("firstName", user.getFirstname());
        response.put("lastName",  user.getLastname());
        response.put("email",     user.getEmail());
        return response;
    }
}