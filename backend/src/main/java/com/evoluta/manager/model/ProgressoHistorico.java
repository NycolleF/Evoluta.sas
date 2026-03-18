package com.evoluta.manager.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "progresso_historico")
public class ProgressoHistorico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private Integer porcentagem = 0;

    @Column(name = "data_referencia")
    private LocalDateTime dataReferencia;

    public Integer getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Integer getPorcentagem() { return porcentagem; }
    public void setPorcentagem(Integer porcentagem) { this.porcentagem = porcentagem; }
    public LocalDateTime getDataReferencia() { return dataReferencia; }
    public void setDataReferencia(LocalDateTime dataReferencia) { this.dataReferencia = dataReferencia; }
}