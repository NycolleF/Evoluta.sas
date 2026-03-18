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
                                        <strong>{ficha.progresso?.porcentagem || 0}%</strong>
                                        <span>{ficha.progresso?.observacao || 'Sem observacao registrada.'}</span>
                                    </div>
                                </div>

                                <div className="drawer-panel">
                                    <h4>Etapas recentes</h4>
                                    {ficha.etapas.length === 0 ? <p className="muted">Nenhuma etapa registrada.</p> : (
                                        <div className="drawer-list">
                                            {ficha.etapas.slice(0, 4).map((etapa) => (
                                                <article key={etapa.id} className="drawer-list-item">
                                                    <strong>{etapa.nomeEtapa}</strong>
                                                    <span>{etapa.tipo} · {etapa.status}</span>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="drawer-panel">
                                    <h4>KPIs recentes</h4>
                                    {ficha.indicadores.length === 0 ? <p className="muted">Nenhum KPI registrado.</p> : (
                                        <div className="drawer-list">
                                            {ficha.indicadores.slice(0, 4).map((indicador) => (
                                                <article key={indicador.id} className="drawer-list-item">
                                                    <strong>{indicador.tipoKpi}</strong>
                                                    <span>{formatarIndicador(indicador.valor, indicador.unidade)}</span>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="drawer-panel">
                                    <h4>Historico de progresso</h4>
                                    {ficha.historico.length === 0 ? <p className="muted">Sem historico registrado.</p> : (
                                        <div className="drawer-list">
                                            {ficha.historico.slice(0, 4).map((item) => (
                                                <article key={item.id} className="drawer-list-item">
                                                    <strong>{item.porcentagem}%</strong>
                                                    <span>{formatarData(item.dataReferencia)}</span>
                                                </article>
                                            ))}
                                        </div>
                                    )}
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
