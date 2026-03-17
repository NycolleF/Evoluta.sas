package com.evoluta.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class IndicadorRequest {
    @NotNull
    private Integer clienteId;

    @NotBlank
    private String tipoKpi;

    @NotNull
    private BigDecimal valor;

    private String unidade;
    private LocalDate data;

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
    public String getTipoKpi() { return tipoKpi; }
    public void setTipoKpi(String tipoKpi) { this.tipoKpi = tipoKpi; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}
