package com.coutodev.agendamento_horario.controller;

import com.coutodev.agendamento_horario.infrastructure.security.TokenService;
import com.coutodev.agendamento_horario.user.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository repository;

    @Autowired
    private TokenService tokenService;


    @PostMapping("/login")
    public ResponseEntity login (@RequestBody AuthenticationDto dto){
      var usernamePassword = new UsernamePasswordAuthenticationToken(dto.login(),dto.password());
      var auth = this.authenticationManager.authenticate(usernamePassword);
      var token = tokenService.generateToken((User) auth.getPrincipal());

      return ResponseEntity.ok(new LoginResponseDto(token));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody RegisterDto dto){
     if (this.repository.findByLogin(dto.login()) != null) return ResponseEntity.badRequest().build();
     String ecryptedPassword = new BCryptPasswordEncoder().encode(dto.password());
        User newuser = new User(dto.login(),ecryptedPassword,dto.role());
       this.repository.save(newuser);
       return ResponseEntity.ok().build();
     }
    }

