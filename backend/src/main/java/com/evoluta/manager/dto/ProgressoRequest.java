package com.evoluta.manager.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ProgressoRequest {
    @NotNull
    private Integer clienteId;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer porcentagem;

    private String observacao;

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    public Integer getPorcentagem() { return porcentagem; }
    public void setPorcentagem(Integer porcentagem) { this.porcentagem = porcentagem; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
