import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import SearchField from '../components/SearchField';

const TIPOS = [
    { value: 'diagnostico', label: 'Diagnostico' },
    { value: 'planejamento', label: 'Planejamento' },
    { value: 'execucao', label: 'Execucao' },
    { value: 'avaliacao', label: 'Avaliacao' },
    { value: 'outro', label: 'Outro' }
];

const STATUS_ETAPA = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em andamento' },
    { value: 'concluida', label: 'Concluida' }
];

function tipoClass(tipo) {
    if (tipo === 'diagnostico') return 'badge badge-neutral';
    if (tipo === 'planejamento') return 'badge badge-warning';
    if (tipo === 'execucao') return 'badge badge-positive';
    if (tipo === 'avaliacao') return 'badge etapa-badge-avaliacao';
    return 'badge';
}

function statusClass(status) {
    if (status === 'concluida') return 'badge badge-positive';
    if (status === 'em_andamento') return 'badge badge-warning';
    return 'badge badge-neutral';
}

function formatarData(data) {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

const initialForm = {
    clienteId: '',
    nomeEtapa: '',
    descricao: '',
    tipo: 'execucao',
    dataEtapa: '',
    status: 'pendente'
};

export default function EtapasPage({ clientes }) {
    const [form, setForm] = useState(initialForm);
    const [buscaCliente, setBuscaCliente] = useState('');
    const [clienteSelecionado, setClienteSelecionado] = useState('');
    const [etapas, setEtapas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [ok, setOk] = useState('');

    const clientesOrdenados = useMemo(
        () => [...clientes].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')),
        [clientes]
    );

    const clientesFiltrados = useMemo(() => {
        const termo = buscaCliente.trim().toLowerCase();
        if (!termo) return clientesOrdenados;
        return clientesOrdenados.filter((c) =>
            (c.nome || '').toLowerCase().includes(termo) ||
            String(c.contato || '').toLowerCase().includes(termo)
        );
    }, [clientesOrdenados, buscaCliente]);

    async function carregarEtapas(id) {
        if (!id) { setEtapas([]); return; }
        setCarregando(true);
        try {
            const resp = await api.get('/etapas', { params: { clienteId: id } });
            setEtapas(resp.data || []);
        } catch {
            setEtapas([]);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarEtapas(clienteSelecionado);
    }, [clienteSelecionado]);

    function onChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErro('');
        setOk('');

        if (!form.clienteId) { setErro('Selecione o cliente.'); return; }
        if (!form.nomeEtapa.trim()) { setErro('Informe o nome da etapa.'); return; }

        setLoading(true);
        try {
            await api.post('/etapas', {
                clienteId: Number(form.clienteId),
                nomeEtapa: form.nomeEtapa.trim(),
                descricao: form.descricao.trim() || null,
                tipo: form.tipo,
                dataEtapa: form.dataEtapa || null,
                status: form.status
            });
            setOk('Etapa criada com sucesso.');
            setForm((prev) => ({ ...initialForm, clienteId: prev.clienteId }));
            if (clienteSelecionado === form.clienteId) {
                carregarEtapas(form.clienteId);
            } else {
                setClienteSelecionado(form.clienteId);
            }
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao foi possivel criar a etapa.');
        } finally {
            setLoading(false);
        }
    }

    async function atualizarStatus(etapaId, novoStatus) {
        try {
            await api.put(`/etapas/${etapaId}`, {
                clienteId: Number(clienteSelecionado),
                nomeEtapa: etapas.find((e) => e.id === etapaId)?.nomeEtapa || '',
                status: novoStatus
            });
            setEtapas((prev) => prev.map((e) => e.id === etapaId ? { ...e, status: novoStatus } : e));
        } catch {
            // silently ignore, user can try again
        }
    }

    const clienteNome = clientesOrdenados.find((c) => String(c.id) === String(clienteSelecionado))?.nome;
    const concluidas = etapas.filter((e) => e.status === 'concluida').length;
    const progresso = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0;

    return (
        <div className="content">
            <div className="card">
                <h3>Nova Etapa de Mentoria</h3>
                {erro ? <div className="error">{erro}</div> : null}
                {ok ? <div className="success">{ok}</div> : null}

                <form className="form-grid" onSubmit={onSubmit}>
                    <SearchField
                        name="buscaCliente"
                        placeholder="Buscar cliente por nome"
                        value={buscaCliente}
                        onChange={(e) => setBuscaCliente(e.target.value)}
                    />
                    <select name="clienteId" value={form.clienteId} onChange={onChange} required>
                        <option value="">Selecione o cliente</option>
                        {clientesFiltrados.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` — ${c.empresa}` : ''}</option>
                        ))}
                    </select>

                    <input name="nomeEtapa" placeholder="Nome da etapa*" value={form.nomeEtapa} onChange={onChange} required />
                    <textarea name="descricao" rows={3} placeholder="Descricao da etapa" value={form.descricao} onChange={onChange} />

                    <div className="form-row">
                        <select name="tipo" value={form.tipo} onChange={onChange}>
                            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <select name="status" value={form.status} onChange={onChange}>
                            {STATUS_ETAPA.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <input name="dataEtapa" type="date" value={form.dataEtapa} onChange={onChange} />
                    </div>

                    <button className="primary" disabled={loading} type="submit">
                        {loading ? 'Salvando...' : 'Criar Etapa'}
                    </button>
                </form>
            </div>

            <div className="card">
                <div className="toolbar">
                    <div>
                        <h3 style={{ marginBottom: 4 }}>Etapas do Cliente</h3>
                        {clienteNome ? <span className="page-kicker">{clienteNome}</span> : null}
                    </div>
                    <select
                        className="etapas-cliente-select"
                        value={clienteSelecionado}
                        onChange={(e) => setClienteSelecionado(e.target.value)}
                    >
                        <option value="">Selecionar cliente</option>
                        {clientesOrdenados.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                {clienteSelecionado && etapas.length > 0 ? (
                    <div className="etapas-progresso">
                        <div className="etapas-progresso-meta">
                            <span>{concluidas} de {etapas.length} etapas concluidas</span>
                            <strong>{progresso}%</strong>
                        </div>
                        <div className="etapas-progresso-bar">
                            <div className="etapas-progresso-fill" style={{ width: `${progresso}%` }} />
                        </div>
                    </div>
                ) : null}

                {carregando ? <p className="muted">Carregando etapas...</p> : null}

                {!carregando && clienteSelecionado && etapas.length === 0 ? (
                    <p className="muted">Nenhuma etapa registrada para este cliente ainda.</p>
                ) : null}

                {!clienteSelecionado ? (
                    <p className="muted">Selecione um cliente para ver as etapas.</p>
                ) : null}

                {etapas.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Etapa</th>
                                <th>Tipo</th>
                                <th>Data</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {etapas.map((e) => (
                                <tr key={e.id}>
                                    <td>
                                        <strong style={{ display: 'block', marginBottom: 2 }}>{e.nomeEtapa}</strong>
                                        {e.descricao ? <span className="muted" style={{ fontSize: '.84rem' }}>{e.descricao}</span> : null}
                                    </td>
                                    <td><span className={tipoClass(e.tipo)}>{e.tipo}</span></td>
                                    <td>{formatarData(e.dataEtapa)}</td>
                                    <td>
                                        <select
                                            className="inline-select"
                                            value={e.status}
                                            onChange={(ev) => atualizarStatus(e.id, ev.target.value)}
                                            aria-label="Alterar status da etapa"
                                        >
                                            {STATUS_ETAPA.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : null}
            </div>
        </div>
    );
}
