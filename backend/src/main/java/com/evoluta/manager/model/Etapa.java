package com.evoluta.manager.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "etapas")
public class Etapa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "nome_etapa", nullable = false, length = 200)
    private String nomeEtapa;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEtapa tipo = TipoEtapa.outro;

    @Column(name = "data_etapa")
    private LocalDate dataEtapa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEtapa status = StatusEtapa.pendente;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public Integer getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getNomeEtapa() { return nomeEtapa; }
    public void setNomeEtapa(String nomeEtapa) { this.nomeEtapa = nomeEtapa; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public TipoEtapa getTipo() { return tipo; }
    public void setTipo(TipoEtapa tipo) { this.tipo = tipo; }
    public LocalDate getDataEtapa() { return dataEtapa; }
    public void setDataEtapa(LocalDate dataEtapa) { this.dataEtapa = dataEtapa; }
    public StatusEtapa getStatus() { return status; }
    public void setStatus(StatusEtapa status) { this.status = status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
