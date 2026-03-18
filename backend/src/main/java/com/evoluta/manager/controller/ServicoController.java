package com.evoluta.manager.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evoluta.manager.dto.ServicoRequest;
import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Servico;
import com.evoluta.manager.model.TipoCobranca;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.ServicoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoRepository servicoRepository;
    private final ClienteRepository clienteRepository;

    public ServicoController(ServicoRepository servicoRepository, ClienteRepository clienteRepository) {
        this.servicoRepository = servicoRepository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<Servico> listar(@RequestParam(required = false) Integer clienteId) {
        if (clienteId != null) {
            return servicoRepository.findByClienteIdOrderByCriadoEmDesc(clienteId);
        }
        return servicoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody ServicoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente nao encontrado.");
        }

        Servico s = new Servico();
        s.setCliente(cliente);
        s.setNomeServico(request.getNomeServico());
        s.setDescricao(request.getDescricao());
        s.setValor(request.getValor());
        if (request.getStatus() != null) s.setStatus(request.getStatus());
        s.setTipoCobranca(request.getTipoCobranca() != null ? request.getTipoCobranca() : TipoCobranca.avista);
        s.setFormaPagamento(request.getFormaPagamento());
        s.setNumeroParcelas(request.getNumeroParcelas());
        s.setDataInicio(request.getDataInicio());
        s.setCriadoEm(LocalDateTime.now());

        return ResponseEntity.ok(servicoRepository.save(s));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @Valid @RequestBody ServicoRequest request) {
        return servicoRepository.findById(id).map(s -> {
            Cliente cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
            if (cliente == null) {
                return ResponseEntity.badRequest().body((Object) "Cliente nao encontrado.");
            }
            s.setCliente(cliente);
            s.setNomeServico(request.getNomeServico());
            s.setDescricao(request.getDescricao());
            s.setValor(request.getValor());
            if (request.getStatus() != null) s.setStatus(request.getStatus());
            if (request.getDataInicio() != null) s.setDataInicio(request.getDataInicio());
            if (request.getTipoCobranca() != null) s.setTipoCobranca(request.getTipoCobranca());
            s.setFormaPagamento(request.getFormaPagamento());
            s.setNumeroParcelas(request.getNumeroParcelas());
            return ResponseEntity.ok((Object) servicoRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        if (!servicoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        servicoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
