package com.evoluta.manager.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reunioes")
public class Reuniao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "data_reuniao", nullable = false)
    private LocalDate dataReuniao;

    @Column(columnDefinition = "TEXT")
    private String anotacoes;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @OneToMany(mappedBy = "reuniao", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReuniaoArquivo> arquivos = new ArrayList<>();

    public Integer getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public LocalDate getDataReuniao() { return dataReuniao; }
    public void setDataReuniao(LocalDate dataReuniao) { this.dataReuniao = dataReuniao; }
    public String getAnotacoes() { return anotacoes; }
    public void setAnotacoes(String anotacoes) { this.anotacoes = anotacoes; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public List<ReuniaoArquivo> getArquivos() { return arquivos; }
    public void setArquivos(List<ReuniaoArquivo> arquivos) { this.arquivos = arquivos; }
}
