package com.evoluta.manager.repository;

import com.evoluta.manager.model.Reuniao;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReuniaoRepository extends JpaRepository<Reuniao, Integer> {
    List<Reuniao> findByDataReuniaoBetweenOrderByDataReuniaoAscCriadoEmDesc(LocalDate inicio, LocalDate fim);
    List<Reuniao> findByClienteIdAndDataReuniaoBetweenOrderByDataReuniaoAscCriadoEmDesc(Integer clienteId, LocalDate inicio, LocalDate fim);
    List<Reuniao> findTop5ByClienteIdOrderByDataReuniaoDescCriadoEmDesc(Integer clienteId);
}
