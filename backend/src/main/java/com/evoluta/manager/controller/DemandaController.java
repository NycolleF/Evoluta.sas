package com.evoluta.manager.controller;

import com.evoluta.manager.dto.DemandaRequest;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Demanda;
import com.evoluta.manager.model.PrioridadeDemanda;
import com.evoluta.manager.model.StatusDemanda;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.DemandaRepository;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demandas")
public class DemandaController {
    private final DemandaRepository demandaRepository;
    private final ClienteRepository clienteRepository;

    public DemandaController(DemandaRepository demandaRepository, ClienteRepository clienteRepository) {
        this.demandaRepository = demandaRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<Demanda> listar(@RequestParam(required = false) LocalDate data) {
        LocalDate alvo = data != null ? data : LocalDate.now();
        return demandaRepository.findByDataDemandaOrderByStatusAscPrioridadeDescCriadoEmAsc(alvo);
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody DemandaRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Cliente nao encontrado."));
        }

        Demanda d = new Demanda();
        d.setCliente(cliente);
        d.setTitulo(request.getTitulo());
        d.setDescricao(request.getDescricao());
        d.setDataDemanda(request.getDataDemanda());
        d.setPrioridade(request.getPrioridade() != null ? request.getPrioridade() : PrioridadeDemanda.media);
        d.setStatus(request.getStatus() != null ? request.getStatus() : StatusDemanda.pendente);
        d.setCriadoEm(LocalDateTime.now());
        return ResponseEntity.ok(demandaRepository.save(d));
    }
}
