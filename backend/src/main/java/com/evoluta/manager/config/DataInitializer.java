package com.evoluta.manager.config;

import com.evoluta.manager.model.Cliente;
import com.evoluta.manager.model.Demanda;
import com.evoluta.manager.model.PrioridadeDemanda;
import com.evoluta.manager.model.Reuniao;
import com.evoluta.manager.model.StatusCliente;
import com.evoluta.manager.model.StatusDemanda;
import com.evoluta.manager.model.Usuario;
import com.evoluta.manager.repository.ClienteRepository;
import com.evoluta.manager.repository.DemandaRepository;
import com.evoluta.manager.repository.ReuniaoRepository;
import com.evoluta.manager.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCrypt;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedData(
            ClienteRepository clienteRepository,
            DemandaRepository demandaRepository,
            ReuniaoRepository reuniaoRepository,
            UsuarioRepository usuarioRepository
    ) {
        return args -> {
            garantirUsuarioPadrao(usuarioRepository);

            List<Cliente> baseClientes = new ArrayList<>(clienteRepository.findAll());
            Set<String> nomesExistentes = baseClientes.stream()
                    .map(Cliente::getNome)
                    .filter(n -> n != null && !n.isBlank())
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());

            Map<String, String[]> demoClientes = Map.of(
                    "Padaria Pao Quente", new String[]{"Ana Paula", "ana@paoquente.com"},
                    "Clinica Vida Leve", new String[]{"Marcos Silva", "marcos@vidaleve.com"},
                    "Studio Aurora", new String[]{"Carla Menezes", "carla@aurora.com"},
                    "Academia Movimento", new String[]{"Joao Pedro", "joao@movimento.com"},
                    "Pet Shop Mundo Animal", new String[]{"Fernanda Lima", "fernanda@mundopet.com"},
                    "Bistro Sabor da Serra", new String[]{"Luciana Gomes", "luciana@serra.com"},
                    "Loja Casa Nobre", new String[]{"Ricardo Alves", "ricardo@casanobre.com"}
            );

            for (Map.Entry<String, String[]> entry : demoClientes.entrySet()) {
                String nomeEmpresa = entry.getKey();
                if (!nomesExistentes.contains(nomeEmpresa.toLowerCase())) {
                    String[] contatoEmail = entry.getValue();
                    criarCliente(clienteRepository, nomeEmpresa, contatoEmail[0], contatoEmail[1]);
                }
            }

            baseClientes = new ArrayList<>(clienteRepository.findAll());

            LocalDate hoje = LocalDate.now();
            if (demandaRepository.countByDataDemanda(hoje) == 0 && !baseClientes.isEmpty()) {
                demandaRepository.save(criarDemanda(baseClientes.get(0), "Revisar fluxo de atendimento", "Mapear gargalos da recepcao", hoje, PrioridadeDemanda.alta, StatusDemanda.pendente));

                if (baseClientes.size() > 1) {
                    demandaRepository.save(criarDemanda(baseClientes.get(1), "Definir campanha semanal", "Planejar acao de retencao no Instagram", hoje, PrioridadeDemanda.media, StatusDemanda.em_andamento));
                }

                if (baseClientes.size() > 2) {
                    demandaRepository.save(criarDemanda(baseClientes.get(2), "Atualizar metas comerciais", "Revisar metas e indicadores do trimestre", hoje, PrioridadeDemanda.alta, StatusDemanda.pendente));
                }

                if (baseClientes.size() > 3) {
                    demandaRepository.save(criarDemanda(baseClientes.get(3), "Treinamento da equipe de vendas", "Definir roteiro de abordagem consultiva", hoje.plusDays(1), PrioridadeDemanda.media, StatusDemanda.pendente));
                }

                if (baseClientes.size() > 4) {
                    demandaRepository.save(criarDemanda(baseClientes.get(4), "Plano de fidelizacao", "Criar campanha mensal para clientes recorrentes", hoje.plusDays(2), PrioridadeDemanda.alta, StatusDemanda.em_andamento));
                }
            }

            LocalDate inicio = hoje.withDayOfMonth(1);
            LocalDate fim = hoje.withDayOfMonth(hoje.lengthOfMonth());
            if (reuniaoRepository.findByDataReuniaoBetweenOrderByDataReuniaoAscCriadoEmDesc(inicio, fim).size() < 10 && !baseClientes.isEmpty()) {
                reuniaoRepository.save(criarReuniao(baseClientes.get(0), hoje.minusDays(1), "Reuniao de acompanhamento. Cliente solicitou revisar fluxo de atendimento."));
                reuniaoRepository.save(criarReuniao(baseClientes.get(0), hoje.plusDays(3), "Reuniao de definicao de indicadores da semana."));

                if (baseClientes.size() > 1) {
                    reuniaoRepository.save(criarReuniao(baseClientes.get(1), hoje, "Alinhamento de campanha e funil de conversao."));
                }

                if (baseClientes.size() > 2) {
                    reuniaoRepository.save(criarReuniao(baseClientes.get(2), hoje.plusDays(2), "Definicao de cronograma de conteudo e planejamento comercial."));
                }

                if (baseClientes.size() > 3) {
                    reuniaoRepository.save(criarReuniao(baseClientes.get(3), hoje.plusDays(5), "Revisao de metas do mes e ajustes da operacao."));
                    reuniaoRepository.save(criarReuniao(baseClientes.get(3), hoje.plusDays(9), "Acompanhamento dos resultados da primeira semana."));
                }

                if (baseClientes.size() > 4) {
                    reuniaoRepository.save(criarReuniao(baseClientes.get(4), hoje.plusDays(7), "Planejamento da campanha de aniversario de clientes."));
                }

                if (baseClientes.size() > 5) {
                    reuniaoRepository.save(criarReuniao(baseClientes.get(5), hoje.plusDays(10), "Ajustes de estoque e composicao de produtos mais vendidos."));
                }

                if (baseClientes.size() > 6) {
                    reuniaoRepository.save(criarReuniao(baseClientes.get(6), hoje.plusDays(12), "Analise de funil e setup de rotinas de follow-up."));
                }
            }
        };
    }

    private void garantirUsuarioPadrao(UsuarioRepository usuarioRepository) {
        Usuario usuario = usuarioRepository.findByEmail("deborah@evoluta.com").orElse(null);
        if (usuario == null) {
            Usuario novo = new Usuario();
            novo.setNome("Deborah Fiussen");
            novo.setEmail("deborah@evoluta.com");
            novo.setSenha(BCrypt.hashpw("password", BCrypt.gensalt()));
            novo.setCriadoEm(LocalDateTime.now());
            usuarioRepository.save(novo);
            return;
        }

        if (!"Deborah Fiussen".equals(usuario.getNome())) {
            usuario.setNome("Deborah Fiussen");
            usuarioRepository.save(usuario);
        }
    }

    private Cliente criarCliente(ClienteRepository repo, String empresa, String contato, String email) {
        Cliente c = new Cliente();
        c.setNome(empresa);
        c.setEmpresa(empresa);
        c.setContato(contato);
        c.setEmail(email);
        c.setStatus(StatusCliente.ativo);
        c.setObservacoes("Cliente de demonstracao");
        c.setCriadoEm(LocalDateTime.now());
        c.setAtualizadoEm(LocalDateTime.now());
        return repo.save(c);
    }

    private Demanda criarDemanda(Cliente cliente, String titulo, String descricao, LocalDate data, PrioridadeDemanda prioridade, StatusDemanda status) {
        Demanda d = new Demanda();
        d.setCliente(cliente);
        d.setTitulo(titulo);
        d.setDescricao(descricao);
        d.setDataDemanda(data);
        d.setPrioridade(prioridade);
        d.setStatus(status);
        d.setCriadoEm(LocalDateTime.now());
        return d;
    }

    private Reuniao criarReuniao(Cliente cliente, LocalDate data, String anotacoes) {
        Reuniao r = new Reuniao();
        r.setCliente(cliente);
        r.setDataReuniao(data);
        r.setAnotacoes(anotacoes);
        r.setCriadoEm(LocalDateTime.now());
        return r;
    }
}
