package com.evoluta.manager.repository;

import com.evoluta.manager.model.Servico;
import com.evoluta.manager.model.StatusServico;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, Integer> {
    List<Servico> findByClienteIdOrderByCriadoEmDesc(Integer clienteId);

    @Query("SELECT s.cliente.id, s.cliente.nome, s.cliente.empresa, SUM(s.valor), COUNT(s) " +
           "FROM Servico s WHERE s.status = :status " +
           "GROUP BY s.cliente.id, s.cliente.nome, s.cliente.empresa " +
           "ORDER BY SUM(s.valor) DESC")
    List<Object[]> receitaAtivaAgrupadaPorCliente(@Param("status") StatusServico status);
}
