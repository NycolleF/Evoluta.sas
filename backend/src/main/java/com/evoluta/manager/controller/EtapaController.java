package com.evoluta.manager.controller;

import com.evoluta.manager.dto.EtapaRequest;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Etapa;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.EtapaRepository;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/etapas")
public class EtapaController {
    private final EtapaRepository etapaRepository;
    private final ClienteRepository clienteRepository;

    public EtapaController(EtapaRepository etapaRepository, ClienteRepository clienteRepository) {
        this.etapaRepository = etapaRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<Etapa> listar(@RequestParam(required = false) Integer clienteId) {
        if (clienteId != null) {
            return etapaRepository.findByClienteIdOrderByDataEtapaDesc(clienteId);
        }
        return etapaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody EtapaRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente nao encontrado.");
        }

        Etapa e = new Etapa();
        e.setCliente(cliente);
        e.setNomeEtapa(request.getNomeEtapa());
        e.setDescricao(request.getDescricao());
        e.setTipo(request.getTipo());
        e.setDataEtapa(request.getDataEtapa());
        e.setStatus(request.getStatus());
        e.setCriadoEm(LocalDateTime.now());

        return ResponseEntity.ok(etapaRepository.save(e));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @Valid @RequestBody EtapaRequest request) {
        return etapaRepository.findById(id).map(e -> {
            Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
            if (cliente == null) {
                return ResponseEntity.badRequest().body((Object) "Cliente nao encontrado.");
            }
            e.setCliente(cliente);
            e.setNomeEtapa(request.getNomeEtapa());
            if (request.getDescricao() != null) e.setDescricao(request.getDescricao());
            if (request.getTipo() != null) e.setTipo(request.getTipo());
            if (request.getDataEtapa() != null) e.setDataEtapa(request.getDataEtapa());
            if (request.getStatus() != null) e.setStatus(request.getStatus());
            return ResponseEntity.ok((Object) etapaRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }
}
