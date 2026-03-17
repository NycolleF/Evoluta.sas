package com.evoluta.manager.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandas")
public class Demanda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "data_demanda", nullable = false)
    private LocalDate dataDemanda;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioridadeDemanda prioridade = PrioridadeDemanda.media;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusDemanda status = StatusDemanda.pendente;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    public Integer getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDate getDataDemanda() { return dataDemanda; }
    public void setDataDemanda(LocalDate dataDemanda) { this.dataDemanda = dataDemanda; }
    public PrioridadeDemanda getPrioridade() { return prioridade; }
    public void setPrioridade(PrioridadeDemanda prioridade) { this.prioridade = prioridade; }
    public StatusDemanda getStatus() { return status; }
    public void setStatus(StatusDemanda status) { this.status = status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
