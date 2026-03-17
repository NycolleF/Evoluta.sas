package com.evoluta.manager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Demanda;
import com.evoluta.manager.model.Progresso;
import com.evoluta.manager.model.StatusCliente;
import com.evoluta.manager.model.StatusEtapa;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.DemandaRepository;
import com.evoluta.manager.repository.EtapaRepository;
import com.evoluta.manager.repository.IndicadorRepository;
import com.evoluta.manager.repository.ProgressoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private DemandaRepository demandaRepository;

    @Mock
    private EtapaRepository etapaRepository;

    @Mock
    private IndicadorRepository indicadorRepository;

    @Mock
    private ProgressoRepository progressoRepository;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
            clienteRepository,
            demandaRepository,
            etapaRepository,
            indicadorRepository,
            progressoRepository
        );
    }

    @Test
    void deveMontarResumoComMediaDeProgressoEClientesRecentesLimitados() {
        when(clienteRepository.count()).thenReturn(8L);
        when(clienteRepository.countByStatus(StatusCliente.ativo)).thenReturn(4L);
        when(clienteRepository.countByStatus(StatusCliente.pausado)).thenReturn(2L);
        when(clienteRepository.countByStatus(StatusCliente.finalizado)).thenReturn(2L);

        when(etapaRepository.count()).thenReturn(10L);
        when(etapaRepository.countByStatus(StatusEtapa.concluida)).thenReturn(6L);
        when(indicadorRepository.count()).thenReturn(5L);

        Progresso p1 = new Progresso();
        p1.setPorcentagem(50);
        Progresso p2 = new Progresso();
        p2.setPorcentagem(100);
        Progresso p3 = new Progresso();
        p3.setPorcentagem(null);
        when(progressoRepository.findAll()).thenReturn(List.of(p1, p2, p3));

        List<Cliente> clientes = IntStream.rangeClosed(1, 8)
            .mapToObj(i -> {
                Cliente c = new Cliente();
                c.setNome("Cliente " + i);
                return c;
            })
            .toList();
        when(clienteRepository.findAll()).thenReturn(clientes);

        List<Demanda> demandasHoje = List.of(new Demanda(), new Demanda());
        when(demandaRepository.findByDataDemandaOrderByStatusAscPrioridadeDescCriadoEmAsc(LocalDate.now()))
            .thenReturn(demandasHoje);
        when(demandaRepository.countByDataDemanda(LocalDate.now())).thenReturn(2L);

        Map<String, Object> resumo = dashboardService.resumo();

        assertEquals(8L, resumo.get("totalClientes"));
        assertEquals(4L, resumo.get("ativos"));
        assertEquals(2L, resumo.get("pausados"));
        assertEquals(2L, resumo.get("finalizados"));
        assertEquals(10L, resumo.get("totalEtapas"));
        assertEquals(6L, resumo.get("etapasConcluidas"));
        assertEquals(5L, resumo.get("totalKpis"));
        assertEquals(new BigDecimal("50.00"), resumo.get("progressoMedio"));
        assertEquals(6, ((List<?>) resumo.get("clientesRecentes")).size());
        assertEquals(demandasHoje, resumo.get("demandasHoje"));
        assertEquals(2L, resumo.get("totalDemandasHoje"));
    }

    @Test
    void deveRetornarMediaZeroQuandoNaoHaProgresso() {
        when(clienteRepository.count()).thenReturn(0L);
        when(clienteRepository.countByStatus(StatusCliente.ativo)).thenReturn(0L);
        when(clienteRepository.countByStatus(StatusCliente.pausado)).thenReturn(0L);
        when(clienteRepository.countByStatus(StatusCliente.finalizado)).thenReturn(0L);
        when(etapaRepository.count()).thenReturn(0L);
        when(etapaRepository.countByStatus(StatusEtapa.concluida)).thenReturn(0L);
        when(indicadorRepository.count()).thenReturn(0L);
        when(progressoRepository.findAll()).thenReturn(List.of());
        when(clienteRepository.findAll()).thenReturn(List.of());
        when(demandaRepository.findByDataDemandaOrderByStatusAscPrioridadeDescCriadoEmAsc(LocalDate.now()))
            .thenReturn(List.of());
        when(demandaRepository.countByDataDemanda(LocalDate.now())).thenReturn(0L);

        Map<String, Object> resumo = dashboardService.resumo();

        assertNotNull(resumo);
        assertEquals(BigDecimal.ZERO, resumo.get("progressoMedio"));
        assertEquals(0, ((List<?>) resumo.get("clientesRecentes")).size());
        assertEquals(0L, resumo.get("totalDemandasHoje"));
    }
}
