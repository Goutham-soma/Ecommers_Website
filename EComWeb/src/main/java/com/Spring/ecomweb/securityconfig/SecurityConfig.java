package com.Spring.ecomweb.securityconfig;

import com.Spring.ecomweb.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // No sessions — JWT only
            .authorizeHttpRequests(auth -> auth

                // ── Public routes ─────────────────────────────────────────
                .requestMatchers("/hello/login").permitAll()
                .requestMatchers("/hello/register").permitAll()
                .requestMatchers("/hello/profile").authenticated()

                // ── SUPER_ADMIN only ──────────────────────────────────────
                .requestMatchers(HttpMethod.POST,   "/api/product").hasRole("SUPER_ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/product/**").hasRole("SUPER_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/product/**").hasRole("SUPER_ADMIN")

                // ── Any logged-in user ────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/products").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/products/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/product/**").authenticated()
                .requestMatchers("/api/orders/**").authenticated()
                .requestMatchers("/api/orders").authenticated()

                .anyRequest().authenticated()
            )
            // Add JWT filter before Spring's default auth filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}