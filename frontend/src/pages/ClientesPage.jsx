import { useMemo, useState } from 'react';
import { api } from '../services/api';
import SearchField from '../components/SearchField';

const initialForm = {
    nome: '',
    empresa: '',
    contato: '',
    email: '',
    status: 'ativo',
    observacoes: ''
};

function statusClass(status) {
    if (status === 'ativo') return 'badge badge-positive';
    if (status === 'pausado') return 'badge badge-warning';
    if (status === 'finalizado') return 'badge badge-dark';
    return 'badge';
}

function formatarData(data) {
    if (!data) return '-';
    const valor = new Date(data);
    if (Number.isNaN(valor.getTime())) return String(data);
    return valor.toLocaleDateString('pt-BR');
}

function formatarIndicador(valor, unidade) {
    const numero = Number(valor || 0);
    if ((unidade || '').toLowerCase() === 'r$') {
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return `${numero.toLocaleString('pt-BR')} ${unidade || ''}`.trim();
}

function Sparkline({ data }) {
    const reversed = [...data].reverse();
    const W = 240, H = 64, PAD = 8;
    const values = reversed.map((d) => Number(d.porcentagem || 0));
    const maxV = Math.max(...values, 1);
    const minV = Math.min(...values, 0);
    const range = maxV - minV || 1;
    const w = W - PAD * 2;
    const h = H - PAD * 2;
    const n = reversed.length;
    const toX = (i) => PAD + (n > 1 ? (i / (n - 1)) * w : w / 2);
    const toY = (v) => PAD + (1 - (v - minV) / range) * h;
    const pts = reversed.map((d, i) => `${toX(i)},${toY(Number(d.porcentagem || 0))}`).join(' ');
    const lastX = toX(n - 1);
    const lastY = toY(values[values.length - 1]);
    const firstDate = formatarData(reversed[0]?.dataReferencia);
    const lastDate = formatarData(reversed[n - 1]?.dataReferencia);

    return (
        <div className="sparkline-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="sparkline-svg" aria-hidden="true" preserveAspectRatio="none">
                {n > 1 && (
                    <polyline
                        fill="rgba(56,161,105,0.13)"
                        stroke="none"
                        points={`${PAD},${PAD + h} ${pts} ${lastX},${PAD + h}`}
                    />
                )}
                <polyline
                    fill="none"
                    stroke="var(--accent-strong)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={pts}
                />
                {reversed.map((d, i) => (
                    <circle
                        key={i}
                        cx={toX(i)}
                        cy={toY(Number(d.porcentagem || 0))}
                        r={i === n - 1 ? 4 : 2.5}
                        fill="var(--accent-strong)"
                        opacity={i === n - 1 ? 1 : 0.45}
                    />
                ))}
            </svg>
            <div className="sparkline-labels">
                <span>{firstDate}</span>
                <span>{lastDate} · <strong>{values[n - 1]}%</strong></span>
            </div>
        </div>
    );
}

function KpiMiniBar({ indicadores }) {
    const nums = indicadores.map((i) => Number(i.valor || 0));
    const maxVal = Math.max(...nums, 0.001);
    return (
        <div className="drawer-list">
            {indicadores.map((ind) => {
                const num = Number(ind.valor || 0);
                const pct = Math.min(100, (num / maxVal) * 100);
                return (
                    <div key={ind.id} className="kpi-mini-card">
                        <div className="kpi-mini-head">
                            <span>{ind.tipoKpi}</span>
                            <strong>{formatarIndicador(ind.valor, ind.unidade)}</strong>
                        </div>
                        <div className="kpi-mini-bar-track">
                            <div className="kpi-mini-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ClientesPage({ clientes, onClienteCriado, onClienteAtualizado }) {
    const [form, setForm] = useState(initialForm);
    const [editandoId, setEditandoId] = useState(null);
    const [busca, setBusca] = useState('');
    const [clienteFicha, setClienteFicha] = useState(null);
    const [ficha, setFicha] = useState(null);
    const [fichaLoading, setFichaLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [ok, setOk] = useState('');

    const clientesOrdenados = useMemo(
        () => [...clientes].sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0)),
        [clientes]
    );

    const clientesFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return clientesOrdenados;
        return clientesOrdenados.filter((c) => {
            const nome = (c.nome || '').toLowerCase();
            const empresa = (c.empresa || '').toLowerCase();
            const contato = String(c.contato || '').toLowerCase();
            const email = (c.email || '').toLowerCase();
            return nome.includes(termo) || empresa.includes(termo) || contato.includes(termo) || email.includes(termo);
        });
    }, [clientesOrdenados, busca]);

    function onChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function iniciarEdicao(cliente) {
        setForm({
            nome: cliente.nome || '',
            empresa: cliente.empresa || '',
            contato: cliente.contato || '',
            email: cliente.email || '',
            status: cliente.status || 'ativo',
            observacoes: cliente.observacoes || ''
        });
        setEditandoId(cliente.id);
        setErro('');
        setOk('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelarEdicao(limparMensagens = true) {
        setForm(initialForm);
        setEditandoId(null);
        if (limparMensagens) {
            setErro('');
            setOk('');
        }
    }

    async function abrirFicha(cliente) {
        setClienteFicha(cliente);
        setFicha(null);
        setFichaLoading(true);

        try {
            const [etapasResp, indicadoresResp, progressoResp, historicoResp, reunioesResp] = await Promise.all([
                api.get('/etapas', { params: { clienteId: cliente.id } }).catch(() => ({ data: [] })),
                api.get('/indicadores', { params: { clienteId: cliente.id } }).catch(() => ({ data: [] })),
                api.get(`/progresso/${cliente.id}`).catch(() => ({ data: null })),
                api.get(`/progresso/historico/${cliente.id}`).catch(() => ({ data: [] })),
                api.get(`/reunioes/recentes/${cliente.id}`).catch(() => ({ data: [] }))
            ]);

            setFicha({
                etapas: etapasResp.data || [],
                indicadores: indicadoresResp.data || [],
                progresso: progressoResp.data || null,
                historico: historicoResp.data || [],
                reunioes: reunioesResp.data || []
            });
        } finally {
            setFichaLoading(false);
        }
    }

    function fecharFicha() {
        setClienteFicha(null);
        setFicha(null);
        setFichaLoading(false);
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!form.nome.trim()) {
            setErro('Informe o nome do cliente.');
            return;
        }

        setErro('');
        setOk('');
        setLoading(true);
        try {
            const payload = {
                ...form,
                nome: form.nome.trim(),
                empresa: form.empresa.trim() || null,
                contato: form.contato.trim() || null,
                email: form.email.trim() || null,
                observacoes: form.observacoes.trim() || null
            };

            if (editandoId) {
                const { data } = await api.put(`/clientes/${editandoId}`, payload);
                onClienteAtualizado?.(data);
                setOk('Cliente atualizado com sucesso.');
                cancelarEdicao(false);

                if (clienteFicha?.id === data.id) {
                    await abrirFicha(data);
                }
            } else {
                const { data } = await api.post('/clientes', payload);
                setForm(initialForm);
                setOk('Cliente cadastrado com sucesso.');
                onClienteCriado?.(data);
            }
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao foi possivel salvar o cliente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="content">
            <div className="card">
                <div className="toolbar">
                    <h3>{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                    {editandoId ? (
                        <button type="button" className="btn-cancel" onClick={cancelarEdicao}>Cancelar edição</button>
                    ) : null}
                </div>
                {erro ? <div className="error">{erro}</div> : null}
                {ok ? <div className="success">{ok}</div> : null}
                <form className="form-grid" onSubmit={onSubmit}>
                    <input name="nome" placeholder="Nome*" value={form.nome} onChange={onChange} required />
                    <input name="empresa" placeholder="Empresa" value={form.empresa} onChange={onChange} />
                    <input name="contato" placeholder="Contato" value={form.contato} onChange={onChange} />
                    <input name="email" placeholder="E-mail" type="email" value={form.email} onChange={onChange} />
                    <select name="status" value={form.status} onChange={onChange}>
                        <option value="ativo">Ativo</option>
                        <option value="pausado">Pausado</option>
                        <option value="finalizado">Finalizado</option>
                    </select>
                    <textarea
                        name="observacoes"
                        placeholder="Observacoes"
                        value={form.observacoes}
                        onChange={onChange}
                        rows={3}
                    />
                    <button className="primary" disabled={loading} type="submit">
                        {loading ? 'Salvando...' : editandoId ? 'Salvar alteracoes' : 'Cadastrar Cliente'}
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>Clientes</h3>
                <SearchField
                    placeholder="Buscar por nome, telefone, empresa ou e-mail"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Empresa</th>
                            <th>Contato</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={5}>Nenhum cliente encontrado.</td>
                            </tr>
                        ) : (
                            clientesFiltrados.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.nome}</td>
                                    <td>{c.empresa || '-'}</td>
                                    <td>{c.contato || c.email || '-'}</td>
                                    <td><span className={statusClass(c.status)}>{c.status}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                type="button"
                                                className="btn-icon btn-icon-soft"
                                                onClick={() => abrirFicha(c)}
                                                title="Abrir ficha do cliente"
                                                aria-label={`Abrir ficha de ${c.nome}`}
                                            >
                                                ○
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon"
                                                onClick={() => iniciarEdicao(c)}
                                                title="Editar cliente"
                                                aria-label={`Editar ${c.nome}`}
                                            >
                                                ✎
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {clienteFicha ? (
                <>
                    <button type="button" className="drawer-overlay" aria-label="Fechar ficha do cliente" onClick={fecharFicha} />
                    <aside className="client-drawer">
                        <div className="client-drawer-head">
                            <div>
                                <span className="page-kicker">Ficha completa</span>
                                <h3>{clienteFicha.nome}</h3>
                                <p>{clienteFicha.empresa || 'Sem empresa informada'}</p>
                            </div>
                            <button type="button" className="btn-cancel" onClick={fecharFicha}>Fechar</button>
                        </div>

                        {fichaLoading ? <p className="muted">Montando a ficha do cliente...</p> : null}

                        {!fichaLoading && ficha ? (
                            <div className="drawer-stack">
                                <div className="drawer-panel">
                                    <h4>Contato e status</h4>
                                    <div className="info-pairs">
                                        <div><span>Status</span><strong>{clienteFicha.status}</strong></div>
                                        <div><span>Contato</span><strong>{clienteFicha.contato || '-'}</strong></div>
                                        <div><span>E-mail</span><strong>{clienteFicha.email || '-'}</strong></div>
                                        <div><span>Observacoes</span><strong>{clienteFicha.observacoes || '-'}</strong></div>
                                    </div>
                                </div>

                                <div className="drawer-panel">
                                    <h4>Progresso atual</h4>
                                    <div className="etapas-progresso-bar large-progress-bar">
                                        <div className="etapas-progresso-fill" style={{ width: `${ficha.progresso?.porcentagem || 0}%` }} />
                                    </div>
                                    <div className="drawer-highlight-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <strong>{ficha.progresso?.porcentagem || 0}%</strong>
                                            {ficha.historico.length >= 2 && (() => {
                                                const delta = ficha.historico[0].porcentagem - ficha.historico[1].porcentagem;
                                                const cls = delta > 0 ? 'tendencia-up' : delta < 0 ? 'tendencia-down' : 'tendencia-flat';
                                                const icon = delta > 0 ? '▲' : delta < 0 ? '▼' : '●';
                                                return <span className={`tendencia-badge ${cls}`}>{icon} {Math.abs(delta)}pp</span>;
                                            })()}
                                        </div>
                                        <span>{ficha.progresso?.observacao || 'Sem observacao registrada.'}</span>
                                    </div>
                                </div>

                                <div className="drawer-panel">
                                    <h4>Etapas recentes</h4>
                                    {ficha.etapas.length === 0 ? <p className="muted">Nenhuma etapa registrada.</p> : (() => {
                                        const concluidas = ficha.etapas.filter((e) => e.status === 'concluida').length;
                                        const total = ficha.etapas.length;
                                        const pct = Math.round((concluidas / total) * 100);
                                        return (
                                            <>
                                                <div className="etapas-mini-bar">
                                                    <div className="etapas-mini-stats">
                                                        <span>{concluidas}/{total} concluídas</span>
                                                        <span>{pct}%</span>
                                                    </div>
                                                    <div className="etapas-mini-track">
                                                        <div className="etapas-mini-fill" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                                <div className="drawer-list">
                                                    {ficha.etapas.slice(0, 4).map((etapa) => (
                                                        <article key={etapa.id} className="drawer-list-item">
                                                            <div className="etapa-dot-row">
                                                                <span className={`etapa-status-dot etapa-status-dot--${etapa.status}`} />
                                                                <strong>{etapa.nomeEtapa}</strong>
                                                            </div>
                                                            <span>{etapa.tipo} · {etapa.status}</span>
                                                        </article>
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="drawer-panel">
                                    <h4>KPIs recentes</h4>
                                    {ficha.indicadores.length === 0
                                        ? <p className="muted">Nenhum KPI registrado.</p>
                                        : <KpiMiniBar indicadores={ficha.indicadores.slice(0, 4)} />
                                    }
                                </div>

                                <div className="drawer-panel">
                                    <h4>Historico de progresso</h4>
                                    {ficha.historico.length === 0
                                        ? <p className="muted">Sem historico registrado.</p>
                                        : <Sparkline data={ficha.historico} />
                                    }
                                </div>

                                <div className="drawer-panel">
                                    <h4>Reunioes recentes</h4>
                                    {ficha.reunioes.length === 0 ? <p className="muted">Nenhuma reuniao recente.</p> : (
                                        <div className="drawer-list">
                                            {ficha.reunioes.map((reuniao) => (
                                                <article key={reuniao.id} className="drawer-list-item">
                                                    <strong>{formatarData(reuniao.dataReuniao)}</strong>
                                                    <span>{reuniao.anotacoes || 'Sem anotacoes.'}</span>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </aside>
                </>
            ) : null}
        </div>
    );
}
