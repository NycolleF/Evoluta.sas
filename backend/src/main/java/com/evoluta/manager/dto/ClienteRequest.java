package com.evoluta.manager.dto;

import com.evoluta.manager.model.StatusCliente;
import jakarta.validation.constraints.NotBlank;

public class ClienteRequest {
    @NotBlank
    private String nome;
    private String empresa;
    private String contato;
    private String email;
    private StatusCliente status = StatusCliente.ativo;
    private String observacoes;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public String getContato() { return contato; }
    public void setContato(String contato) { this.contato = contato; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public StatusCliente getStatus() { return status; }
    public void setStatus(StatusCliente status) { this.status = status; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
