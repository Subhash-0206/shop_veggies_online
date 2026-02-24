package com.veggie.user.dto;

import com.veggie.user.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private User.Role role = User.Role.ROLE_USER;
    private String address;
    private String phone;
}
