import { useState } from 'react';
import { api } from '../services/api';

function moeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function badgeClass(value) {
    const raw = String(value || '').toLowerCase();
    if (raw.includes('alta') || raw.includes('ativo') || raw.includes('conclu')) return 'badge badge-positive';
    if (raw.includes('andamento') || raw.includes('media')) return 'badge badge-warning';
    if (raw.includes('pendente') || raw.includes('pausado') || raw.includes('baixa')) return 'badge badge-neutral';
    if (raw.includes('finalizado')) return 'badge badge-dark';
    return 'badge';
}

export default function DashboardPage({ resumo, onResumoChange }) {
    const [demandas, setDemandas] = useState(() => resumo?.demandasHoje || []);
    const [savingId, setSavingId] = useState(null);

    const lista = resumo?.demandasHoje || demandas;

    async function atualizarDemanda(id, campo, valor) {
        setSavingId(id);
        try {
            const { data } = await api.patch(`/demandas/${id}`, { [campo]: valor });
            onResumoChange?.((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    demandasHoje: (prev.demandasHoje || []).map((d) => d.id === id ? data : d)
                };
            });
        } catch {
            // silent — user can try again
        } finally {
            setSavingId(null);
        }
    }

    return (
        <div className="content">
            <section className="hero-card">
                <div>
                    <span className="page-kicker">Resumo de hoje</span>
                    <h3>Visao rapida da operacao</h3>
                    <p>Acompanhe clientes ativos, demandas prioritarias e o ritmo geral do dia em um unico painel.</p>
                </div>
            </section>

            <div className="grid">
                <article className="tile">
                    <small>Total clientes</small>
                    <strong>{resumo?.totalClientes ?? 0}</strong>
                </article>
                <article className="tile">
                    <small>Ativos</small>
                    <strong>{resumo?.ativos ?? 0}</strong>
                </article>
                <article className="tile">
                    <small>Demandas hoje</small>
                    <strong>{resumo?.totalDemandasHoje ?? 0}</strong>
                </article>
                <article className="tile">
                    <small>Progresso medio</small>
                    <strong>{resumo?.progressoMedio ?? 0}%</strong>
                </article>
                <article className="tile tile--accent">
                    <small>Receita total ativa</small>
                    <strong>{moeda(resumo?.receitaTotal ?? 0)}</strong>
                </article>
                <article className="tile tile--accent">
                    <small>Recebimento no mes (sem adiantar)</small>
                    <strong>{moeda(resumo?.recebimentoMensalSemAdiantamento ?? 0)}</strong>
                </article>
            </div>

            <div className="card">
                <h3>Receita por Cliente</h3>
                {(!resumo?.receitaPorCliente || resumo.receitaPorCliente.length === 0) ? (
                    <p className="muted">Nenhum servico ativo cadastrado ainda.</p>
                ) : (
                    <>
                        <div className="receita-grid">
                            {resumo.receitaPorCliente.map((r) => (
                                <article key={r.clienteId} className="receita-card">
                                    <div className="receita-card-top">
                                        <div>
                                            <strong>{r.nomeCliente}</strong>
                                            {r.empresa && <span className="muted" style={{ fontSize: '.82rem', display: 'block' }}>{r.empresa}</span>}
                                        </div>
                                        <span className="receita-badge">{r.totalServicos} serv.</span>
                                    </div>
                                    <div className="receita-valor">{moeda(r.receitaAtiva)}</div>
                                    <span className="muted" style={{ fontSize: '.8rem' }}>
                                        No mes (sem adiantar): {moeda(r.recebimentoMensal ?? 0)}
                                    </span>
                                    <div className="receita-bar-track">
                                        <div
                                            className="receita-bar-fill"
                                            style={{
                                                width: `${Math.min(100, (Number(r.receitaAtiva) / Number(resumo.receitaTotal)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="card">
                <h3>Demandas do dia por cliente</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Demanda</th>
                            <th>Prioridade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.length === 0 ? (
                            <tr>
                                <td colSpan={4}>Nenhuma demanda para hoje.</td>
                            </tr>
                        ) : (
                            lista.map((d) => (
                                <tr key={d.id} className={savingId === d.id ? 'row-saving' : ''}>
                                    <td>{d.cliente?.nome || '-'}</td>
                                    <td>
                                        <strong style={{ display: 'block' }}>{d.titulo}</strong>
                                        {d.descricao ? <span className="muted" style={{ fontSize: '.82rem' }}>{d.descricao}</span> : null}
                                    </td>
                                    <td>
                                        <select
                                            className="inline-select"
                                            value={d.prioridade}
                                            onChange={(e) => atualizarDemanda(d.id, 'prioridade', e.target.value)}
                                            aria-label="Alterar prioridade"
                                        >
                                            <option value="baixa">Baixa</option>
                                            <option value="media">Media</option>
                                            <option value="alta">Alta</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            className="inline-select"
                                            value={d.status}
                                            onChange={(e) => atualizarDemanda(d.id, 'status', e.target.value)}
                                            aria-label="Alterar status"
                                        >
                                            <option value="pendente">Pendente</option>
                                            <option value="em_andamento">Em andamento</option>
                                            <option value="concluida">Concluida</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

