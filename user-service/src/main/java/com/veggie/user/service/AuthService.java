package com.veggie.user.service;

import com.veggie.user.dto.*;
import com.veggie.user.model.User;
import com.veggie.user.model.Address;
import com.veggie.user.repository.UserRepository;
import com.veggie.user.security.CustomUserDetailsService;
import com.veggie.user.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;
        private final CustomUserDetailsService userDetailsService;

        @jakarta.annotation.PostConstruct
        public void initAdmin() {
                // Default admin
                if (!userRepository.existsByEmail("admin@veggieshop.com")) {
                        User admin = User.builder()
                                        .name("Admin User")
                                        .email("admin@veggieshop.com")
                                        .password(passwordEncoder.encode("admin123"))
                                        .role(User.Role.ROLE_ADMIN)
                                        .phone("555-0199")
                                        .build();
                        admin.setAddresses(java.util.List.of(Address.builder()
                                        .street("123 Farm Road")
                                        .city("Green City")
                                        .state("GC")
                                        .zipCode("12345")
                                        .isDefault(true)
                                        .user(admin)
                                        .build()));
                        userRepository.save(admin);
                } else {
                        // Ensure password is correct for existing admin
                        User admin = userRepository.findByEmail("admin@veggieshop.com").get();
                        admin.setPassword(passwordEncoder.encode("admin123"));
                        admin.setRole(User.Role.ROLE_ADMIN);
                        userRepository.save(admin);
                }

                // New admin requested by user
                String userEmail = "msubhash535@gmail.com";
                if (!userRepository.existsByEmail(userEmail)) {
                        User userAdmin = User.builder()
                                        .name("Subhash Admin")
                                        .email(userEmail)
                                        .password(passwordEncoder.encode("QWERqwer@1817"))
                                        .role(User.Role.ROLE_ADMIN)
                                        .phone("555-0100")
                                        .build();
                        userAdmin.setAddresses(java.util.List.of(Address.builder()
                                        .street("Admin Office")
                                        .city("Admin City")
                                        .state("AC")
                                        .zipCode("00000")
                                        .isDefault(true)
                                        .user(userAdmin)
                                        .build()));
                        userRepository.save(userAdmin);
                } else {
                        User userAdmin = userRepository.findByEmail(userEmail).get();
                        userAdmin.setPassword(passwordEncoder.encode("QWERqwer@1817"));
                        userAdmin.setRole(User.Role.ROLE_ADMIN);
                        userRepository.save(userAdmin);
                }
        }

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already registered");
                }
                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : User.Role.ROLE_USER)
                                .phone(request.getPhone())
                                .build();
                if (request.getAddress() != null && !request.getAddress().isEmpty()) {
                        user.setAddresses(java.util.List.of(Address.builder()
                                        .street(request.getAddress())
                                        .city("Default")
                                        .state("Default")
                                        .zipCode("00000")
                                        .isDefault(true)
                                        .user(user)
                                        .build()));
                }
                userRepository.save(user);
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String token = jwtUtil.generateToken(userDetails, user.getRole().name());
                return AuthResponse.builder()
                                .token(token)
                                .email(user.getEmail())
                                .name(user.getName())
                                .role(user.getRole())
                                .userId(user.getId())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String token = jwtUtil.generateToken(userDetails, user.getRole().name());
                return AuthResponse.builder()
                                .token(token)
                                .email(user.getEmail())
                                .name(user.getName())
                                .role(user.getRole())
                                .userId(user.getId())
                                .build();
        }
}
