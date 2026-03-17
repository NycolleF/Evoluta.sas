package com.evoluta.manager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.evoluta.manager.dto.LoginRequest;
import com.evoluta.manager.dto.LoginResponse;
import com.evoluta.manager.model.Usuario;
import com.evoluta.manager.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(usuarioRepository);
    }

    @Test
    void deveRetornarFalhaQuandoUsuarioNaoExiste() {
        LoginRequest request = new LoginRequest();
        request.setEmail("usuario@inexistente.com");
        request.setSenha("senha");

        when(usuarioRepository.findByEmail("usuario@inexistente.com")).thenReturn(Optional.empty());

        LoginResponse response = authService.login(request);

        assertFalse(response.isSucesso());
        assertEquals("E-mail ou senha inválidos.", response.getMensagem());
        assertNull(response.getUsuarioId());
        assertNull(response.getNome());
        assertNull(response.getEmail());
    }

    @Test
    void deveRetornarFalhaQuandoSenhaInvalida() {
        LoginRequest request = new LoginRequest();
        request.setEmail("deborah@evoluta.com");
        request.setSenha("senha-incorreta");

        Usuario usuario = new Usuario();
        usuario.setEmail("deborah@evoluta.com");
        usuario.setSenha(BCrypt.hashpw("password", BCrypt.gensalt()));

        when(usuarioRepository.findByEmail("deborah@evoluta.com")).thenReturn(Optional.of(usuario));

        LoginResponse response = authService.login(request);

        assertFalse(response.isSucesso());
        assertEquals("E-mail ou senha inválidos.", response.getMensagem());
    }

    @Test
    void deveRetornarSucessoQuandoCredenciaisValidas() {
        LoginRequest request = new LoginRequest();
        request.setEmail("deborah@evoluta.com");
        request.setSenha("password");

        Usuario usuario = new Usuario();
        usuario.setNome("Deborah Fiussen");
        usuario.setEmail("deborah@evoluta.com");
        usuario.setSenha(BCrypt.hashpw("password", BCrypt.gensalt()));

        when(usuarioRepository.findByEmail("deborah@evoluta.com")).thenReturn(Optional.of(usuario));

        LoginResponse response = authService.login(request);

        assertTrue(response.isSucesso());
        assertEquals("Login realizado com sucesso.", response.getMensagem());
        assertEquals("Deborah Fiussen", response.getNome());
        assertEquals("deborah@evoluta.com", response.getEmail());
    }
}
