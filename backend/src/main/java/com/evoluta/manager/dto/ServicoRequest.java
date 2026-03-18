package com.evoluta.manager.dto;

import com.evoluta.manager.model.FormaPagamento;
import com.evoluta.manager.model.StatusServico;
import com.evoluta.manager.model.TipoCobranca;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ServicoRequest {

    @NotNull
    private Integer clienteId;

    @NotBlank
    private String nomeServico;

    private String descricao;

    @NotNull
    private BigDecimal valor;

    private StatusServico status = StatusServico.ativo;

    private TipoCobranca tipoCobranca = TipoCobranca.avista;

    private FormaPagamento formaPagamento;

    private Integer numeroParcelas;

    private LocalDate dataInicio;

    public Integer getClienteId() { return clienteId; }
    public void setClienteId(Integer clienteId) { this.clienteId = clienteId; }

    public String getNomeServico() { return nomeServico; }
    public void setNomeServico(String nomeServico) { this.nomeServico = nomeServico; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public StatusServico getStatus() { return status; }
    public void setStatus(StatusServico status) { this.status = status; }

    public TipoCobranca getTipoCobranca() { return tipoCobranca; }
    public void setTipoCobranca(TipoCobranca tipoCobranca) { this.tipoCobranca = tipoCobranca; }

    public FormaPagamento getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(FormaPagamento formaPagamento) { this.formaPagamento = formaPagamento; }

    public Integer getNumeroParcelas() { return numeroParcelas; }
    public void setNumeroParcelas(Integer numeroParcelas) { this.numeroParcelas = numeroParcelas; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
}
