package com.evoluta.manager.controller;

import com.evoluta.manager.dto.ProgressoRequest;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Progresso;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.ProgressoRepository;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progresso")
public class ProgressoController {
    private final ProgressoRepository progressoRepository;
    private final ClienteRepository clienteRepository;

    public ProgressoController(ProgressoRepository progressoRepository, ClienteRepository clienteRepository) {
        this.progressoRepository = progressoRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping("/{clienteId}")
    public ResponseEntity<Progresso> buscar(@PathVariable Integer clienteId) {
        return progressoRepository.findTopByClienteIdOrderByDataAtualizacaoDesc(clienteId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> atualizar(@Valid @RequestBody ProgressoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente não encontrado.");
        }

        Progresso progresso = progressoRepository.findTopByClienteIdOrderByDataAtualizacaoDesc(request.getClienteId())
            .orElseGet(Progresso::new);

        progresso.setCliente(cliente);
        progresso.setPorcentagem(request.getPorcentagem());
        progresso.setObservacao(request.getObservacao());
        progresso.setDataAtualizacao(LocalDateTime.now());

        return ResponseEntity.ok(progressoRepository.save(progresso));
    }
}
