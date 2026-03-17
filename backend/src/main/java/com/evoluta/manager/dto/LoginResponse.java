package com.evoluta.manager.dto;

public class LoginResponse {
    private boolean sucesso;
    private String mensagem;
    private Integer usuarioId;
    private String nome;
    private String email;

    public LoginResponse() {}

    public LoginResponse(boolean sucesso, String mensagem, Integer usuarioId, String nome, String email) {
        this.sucesso = sucesso;
        this.mensagem = mensagem;
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.email = email;
    }

    public boolean isSucesso() { return sucesso; }
    public void setSucesso(boolean sucesso) { this.sucesso = sucesso; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
