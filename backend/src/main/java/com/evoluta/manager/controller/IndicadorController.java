package com.evoluta.manager.controller;

import com.evoluta.manager.dto.IndicadorRequest;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Indicador;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.IndicadorRepository;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/indicadores")
public class IndicadorController {
    private final IndicadorRepository indicadorRepository;
    private final ClienteRepository clienteRepository;

    public IndicadorController(IndicadorRepository indicadorRepository, ClienteRepository clienteRepository) {
        this.indicadorRepository = indicadorRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<Indicador> listar(@RequestParam(required = false) Integer clienteId) {
        if (clienteId != null) {
            return indicadorRepository.findByClienteIdOrderByDataDesc(clienteId);
        }
        return indicadorRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody IndicadorRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente não encontrado.");
        }

        Indicador i = new Indicador();
        i.setCliente(cliente);
        i.setTipoKpi(request.getTipoKpi());
        i.setValor(request.getValor());
        i.setUnidade(request.getUnidade());
        i.setData(request.getData());
        i.setCriadoEm(LocalDateTime.now());

        return ResponseEntity.ok(indicadorRepository.save(i));
    }
}
