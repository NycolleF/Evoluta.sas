package com.evoluta.manager.service;

import com.evoluta.manager.model.StatusCliente;
import com.evoluta.manager.model.StatusEtapa;
import com.evoluta.manager.model.StatusServico;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.DemandaRepository;
import com.evoluta.manager.repository.EtapaRepository;
import com.evoluta.manager.repository.IndicadorRepository;
import com.evoluta.manager.repository.ProgressoRepository;
import com.evoluta.manager.repository.ServicoRepository;
import com.evoluta.manager.model.Progresso;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final ClienteRepository clienteRepository;
    private final DemandaRepository demandaRepository;
    private final EtapaRepository etapaRepository;
    private final IndicadorRepository indicadorRepository;
    private final ProgressoRepository progressoRepository;
    private final ServicoRepository servicoRepository;

    public DashboardService(
        ClienteRepository clienteRepository,
        DemandaRepository demandaRepository,
        EtapaRepository etapaRepository,
        IndicadorRepository indicadorRepository,
        ProgressoRepository progressoRepository,
        ServicoRepository servicoRepository
    ) {
        this.clienteRepository = clienteRepository;
        this.demandaRepository = demandaRepository;
        this.etapaRepository = etapaRepository;
        this.indicadorRepository = indicadorRepository;
        this.progressoRepository = progressoRepository;
        this.servicoRepository = servicoRepository;
    }

    public Map<String, Object> resumo() {
        Map<String, Object> data = new HashMap<>();
        long totalClientes = clienteRepository.count();
        data.put("totalClientes", totalClientes);
        data.put("ativos", clienteRepository.countByStatus(StatusCliente.ativo));
        data.put("pausados", clienteRepository.countByStatus(StatusCliente.pausado));
        data.put("finalizados", clienteRepository.countByStatus(StatusCliente.finalizado));
        data.put("totalEtapas", etapaRepository.count());
        data.put("etapasConcluidas", etapaRepository.countByStatus(StatusEtapa.concluida));
        data.put("totalKpis", indicadorRepository.count());

        List<Progresso> progressos = progressoRepository.findAll();
        BigDecimal media = progressos.stream()
            .map(p -> BigDecimal.valueOf(p.getPorcentagem() != null ? p.getPorcentagem().doubleValue() : 0D))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (!progressos.isEmpty()) {
            media = media.divide(BigDecimal.valueOf(progressos.size()), 2, RoundingMode.HALF_UP);
        }

        data.put("progressoMedio", media);
        data.put("clientesRecentes", clienteRepository.findAll().stream().limit(6).toList());
        data.put("demandasHoje", demandaRepository.findByDataDemandaOrderByStatusAscPrioridadeDescCriadoEmAsc(LocalDate.now()));
        data.put("totalDemandasHoje", demandaRepository.countByDataDemanda(LocalDate.now()));

        // Receita por cliente (servicos ativos)
        List<Object[]> receitaRows = servicoRepository.receitaAtivaAgrupadaPorCliente(StatusServico.ativo);
        BigDecimal receitaTotal = receitaRows.stream()
            .map(r -> (BigDecimal) r[3])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("receitaTotal", receitaTotal);

        List<Map<String, Object>> receitaPorCliente = receitaRows.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("clienteId", row[0]);
            m.put("nomeCliente", row[1]);
            m.put("empresa", row[2]);
            m.put("receitaAtiva", row[3]);
            m.put("totalServicos", row[4]);
            return m;
        }).toList();
        data.put("receitaPorCliente", receitaPorCliente);

        return data;
    }
}
