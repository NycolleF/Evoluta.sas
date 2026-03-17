package com.evoluta.manager.controller;

import com.evoluta.manager.dto.ClienteRequest;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.StatusCliente;
import com.evoluta.manager.repository.ClienteRepository;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findAll(Sort.by(Sort.Direction.DESC, "criadoEm"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscar(@PathVariable Integer id) {
        return clienteRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cliente criar(@Valid @RequestBody ClienteRequest request) {
        Cliente c = new Cliente();
        c.setNome(request.getNome());
        c.setEmpresa(request.getEmpresa());
        c.setContato(request.getContato());
        c.setEmail(request.getEmail());
        c.setStatus(request.getStatus() != null ? request.getStatus() : StatusCliente.ativo);
        c.setObservacoes(request.getObservacoes());
        c.setCriadoEm(LocalDateTime.now());
        c.setAtualizadoEm(LocalDateTime.now());
        return clienteRepository.save(c);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(@PathVariable Integer id, @Valid @RequestBody ClienteRequest request) {
        return clienteRepository.findById(id).map(c -> {
            c.setNome(request.getNome());
            c.setEmpresa(request.getEmpresa());
            c.setContato(request.getContato());
            c.setEmail(request.getEmail());
            c.setStatus(request.getStatus() != null ? request.getStatus() : StatusCliente.ativo);
            c.setObservacoes(request.getObservacoes());
            c.setAtualizadoEm(LocalDateTime.now());
            return ResponseEntity.ok(clienteRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        if (!clienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clienteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
