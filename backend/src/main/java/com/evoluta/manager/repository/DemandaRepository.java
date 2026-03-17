package com.evoluta.manager.repository;

import com.evoluta.manager.model.Demanda;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemandaRepository extends JpaRepository<Demanda, Integer> {
    List<Demanda> findByDataDemandaOrderByStatusAscPrioridadeDescCriadoEmAsc(LocalDate dataDemanda);
    long countByDataDemanda(LocalDate dataDemanda);
}
