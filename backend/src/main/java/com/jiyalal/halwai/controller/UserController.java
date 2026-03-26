package com.jiyalal.halwai.controller;

import com.jiyalal.halwai.model.User;
import com.jiyalal.halwai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class UserController {

    @Autowired private UserRepository userRepo;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        List<User> users = userRepo.findAll();
        users.forEach(u -> u.setPassword(null)); // Never return password
        return users;
    }
}
