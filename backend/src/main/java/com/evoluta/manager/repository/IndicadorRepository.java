package com.evoluta.manager.repository;

import com.evoluta.manager.model.Indicador;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IndicadorRepository extends JpaRepository<Indicador, Integer> {
    List<Indicador> findByClienteIdOrderByDataDesc(Integer clienteId);
}
