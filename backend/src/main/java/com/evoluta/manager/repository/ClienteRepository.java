package com.evoluta.manager.repository;

import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.StatusCliente;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    List<Cliente> findByStatus(StatusCliente status);
    long countByStatus(StatusCliente status);
}
