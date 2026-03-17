package com.evoluta.manager.dto;

import com.evoluta.manager.model.StatusEtapa;
import com.evoluta.manager.model.TipoEtapa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EtapaRequest {
    @NotNull
    private Integer clienteId;

    @NotBlank
    private String nomeEtapa;

    private String descricao;
    private TipoEtapa tipo = TipoEtapa.outro;
    private LocalDate dataEtapa;
    private StatusEtapa status = StatusEtapa.pendente;

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }
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
}
