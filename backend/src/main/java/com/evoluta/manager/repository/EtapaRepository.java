package com.evoluta.manager.repository;

import com.evoluta.manager.model.Etapa;
import com.evoluta.manager.model.StatusEtapa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EtapaRepository extends JpaRepository<Etapa, Integer> {
    List<Etapa> findByClienteIdOrderByDataEtapaDesc(Integer clienteId);
    long countByStatus(StatusEtapa status);
}
