package com.veggie.user.service;

import com.veggie.user.model.User;
import com.veggie.user.model.Address;
import com.veggie.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(String email, User updatedUser) {
        User user = getUserByEmail(email);
        user.setName(updatedUser.getName());
        user.setPhone(updatedUser.getPhone());
        return userRepository.save(user);
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUserById(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setRole(updatedUser.getRole());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()
                && !updatedUser.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void updatePassword(String email, String oldPassword, String newPassword) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User addAddress(String email, Address address) {
        User user = getUserByEmail(email);
        address.setUser(user);
        if (user.getAddresses() == null) {
            user.setAddresses(new java.util.ArrayList<>());
        }
        if (address.isDefaultAddress()) {
            user.getAddresses().forEach(a -> a.setDefaultAddress(false));
        } else if (user.getAddresses().isEmpty()) {
            address.setDefaultAddress(true);
        }
        user.getAddresses().add(address);
        return userRepository.save(user);
    }

    @Transactional
    public User removeAddress(String email, Long addressId) {
        User user = getUserByEmail(email);
        user.getAddresses().removeIf(a -> a.getId().equals(addressId));
        return userRepository.save(user);
    }

    @Transactional
    public User setDefaultAddress(String email, Long addressId) {
        User user = getUserByEmail(email);
        user.getAddresses().forEach(a -> a.setDefaultAddress(a.getId().equals(addressId)));
        return userRepository.save(user);
    }
}
