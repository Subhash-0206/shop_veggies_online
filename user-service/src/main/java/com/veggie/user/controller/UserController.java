package com.veggie.user.controller;

import com.veggie.user.model.User;
import com.veggie.user.model.Address;
import com.veggie.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserByEmail(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(Authentication authentication, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(authentication.getName(), user));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> updatePassword(Authentication authentication,
            @RequestBody java.util.Map<String, String> request) {
        userService.updatePassword(authentication.getName(), request.get("oldPassword"), request.get("newPassword"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<User> addAddress(Authentication authentication, @RequestBody Address address) {
        return ResponseEntity.ok(userService.addAddress(authentication.getName(), address));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<User> removeAddress(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(userService.removeAddress(authentication.getName(), id));
    }

    @PutMapping("/me/addresses/{id}/default")
    public ResponseEntity<User> setDefaultAddress(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(userService.setDefaultAddress(authentication.getName(), id));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> updateUserById(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUserById(id, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
