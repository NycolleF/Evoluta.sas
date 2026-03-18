package com.evoluta.manager.repository;

import com.evoluta.manager.model.ProgressoHistorico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressoHistoricoRepository extends JpaRepository<ProgressoHistorico, Integer> {
    List<ProgressoHistorico> findTop12ByClienteIdOrderByDataReferenciaDesc(Integer clienteId);
}