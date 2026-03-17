package com.evoluta.manager.dto;

import com.evoluta.manager.model.PrioridadeDemanda;
import com.evoluta.manager.model.StatusDemanda;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class DemandaRequest {
    @NotNull
    private Integer clienteId;

    @NotBlank
    private String titulo;

    private String descricao;

    @NotNull
    private LocalDate dataDemanda;

    private PrioridadeDemanda prioridade = PrioridadeDemanda.media;
    private StatusDemanda status = StatusDemanda.pendente;

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
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
}
