package com.evoluta.manager.service;

import com.evoluta.manager.dto.LoginRequest;
import com.evoluta.manager.dto.LoginResponse;
import com.evoluta.manager.model.Usuario;
import com.evoluta.manager.repository.UsuarioRepository;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse login(LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail().trim());
        if (usuarioOpt.isEmpty()) {
            return new LoginResponse(false, "E-mail ou senha inválidos.", null, null, null);
        }

        Usuario usuario = usuarioOpt.get();
        if (!BCrypt.checkpw(request.getSenha(), usuario.getSenha())) {
            return new LoginResponse(false, "E-mail ou senha inválidos.", null, null, null);
        }

        return new LoginResponse(true, "Login realizado com sucesso.", usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
