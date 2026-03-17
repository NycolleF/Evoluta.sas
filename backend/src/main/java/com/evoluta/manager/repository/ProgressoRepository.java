package com.evoluta.manager.repository;

import com.evoluta.manager.model.Progresso;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressoRepository extends JpaRepository<Progresso, Integer> {
    Optional<Progresso> findTopByClienteIdOrderByDataAtualizacaoDesc(Integer clienteId);
}
