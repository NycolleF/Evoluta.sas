package com.evoluta.manager.controller;

import com.evoluta.manager.dto.ProgressoRequest;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Progresso;
import com.evoluta.manager.model.ProgressoHistorico;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.ProgressoHistoricoRepository;
import com.evoluta.manager.repository.ProgressoRepository;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progresso")
public class ProgressoController {
    private final ProgressoRepository progressoRepository;
    private final ProgressoHistoricoRepository progressoHistoricoRepository;
    private final ClienteRepository clienteRepository;

    public ProgressoController(
        ProgressoRepository progressoRepository,
        ProgressoHistoricoRepository progressoHistoricoRepository,
        ClienteRepository clienteRepository
    ) {
        this.progressoRepository = progressoRepository;
        this.progressoHistoricoRepository = progressoHistoricoRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping("/{clienteId}")
    public ResponseEntity<Progresso> buscar(@PathVariable Integer clienteId) {
        return progressoRepository.findTopByClienteIdOrderByDataAtualizacaoDesc(clienteId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/historico/{clienteId}")
    public List<ProgressoHistorico> historico(@PathVariable Integer clienteId) {
        return progressoHistoricoRepository.findTop12ByClienteIdOrderByDataReferenciaDesc(clienteId);
    }

    @PostMapping
    public ResponseEntity<?> atualizar(@Valid @RequestBody ProgressoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente nao encontrado.");
        }

        LocalDateTime agora = LocalDateTime.now();
        Progresso progresso = progressoRepository.findTopByClienteIdOrderByDataAtualizacaoDesc(request.getClienteId())
            .orElseGet(Progresso::new);

        progresso.setCliente(cliente);
        progresso.setPorcentagem(request.getPorcentagem());
        progresso.setObservacao(request.getObservacao());
        progresso.setDataAtualizacao(agora);

        ProgressoHistorico historico = new ProgressoHistorico();
        historico.setCliente(cliente);
        historico.setPorcentagem(request.getPorcentagem());
        historico.setDataReferencia(agora);
        progressoHistoricoRepository.save(historico);

        return ResponseEntity.ok(progressoRepository.save(progresso));
    }
}
