import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const initialForm = {
    clienteId: '',
    nomeServico: '',
    descricao: '',
    valor: '',
    status: 'ativo',
    tipoCobranca: 'avista',
    formaPagamento: '',
    numeroParcelas: '',
    dataInicio: ''
};

function statusClass(status) {
    if (status === 'ativo') return 'badge badge-positive';
    if (status === 'pausado') return 'badge badge-warning';
    if (status === 'cancelado') return 'badge badge-dark';
    return 'badge';
}

function moeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
    if (!data) return '-';
    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return String(data);
    return d.toLocaleDateString('pt-BR');
}

function primeiraEntradaMensal(servico) {
    if (servico.tipoCobranca !== 'parcelado' || servico.formaPagamento !== 'por_mes') return null;
    const base = servico.dataInicio ? new Date(servico.dataInicio) : new Date();
    if (Number.isNaN(base.getTime())) return null;
    const primeiro = new Date(base);
    primeiro.setMonth(primeiro.getMonth() + 1);
    return primeiro;
}

function pagamentoInfo(s) {
    const tipo = s.tipoCobranca || 'avista';
    if (tipo === 'avista') return { texto: 'A vista', cls: 'pagamento-tag--avista' };
    const n = Number(s.numeroParcelas || 1);
    if (s.formaPagamento === 'adiantado') return { texto: `${n}x adiantado`, cls: 'pagamento-tag--adiantado' };
    return { texto: `${n}x · ${moeda(Number(s.valor || 0) / n)}/mes`, cls: 'pagamento-tag--parcelado' };
}

export default function ServicosPage({ clientes, onServicosChange }) {
    const [clienteSelecionado, setClienteSelecionado] = useState('');
    const [servicos, setServicos] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(false);

    const [form, setForm] = useState(initialForm);
    const [editandoId, setEditandoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [ok, setOk] = useState('');

    const clientesAtivos = useMemo(
        () => [...clientes].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')),
        [clientes]
    );

    useEffect(() => {
        if (!clienteSelecionado) {
            setServicos([]);
            return;
        }
        setLoadingServicos(true);
        api.get('/servicos', { params: { clienteId: clienteSelecionado } })
            .then((r) => setServicos(r.data || []))
            .catch(() => setServicos([]))
            .finally(() => setLoadingServicos(false));
    }, [clienteSelecionado]);

    const resumo = useMemo(() => {
        const total = servicos.length;
        const ativos = servicos.filter((s) => s.status === 'ativo').length;
        const totalValor = servicos
            .filter((s) => s.status === 'ativo')
            .reduce((acc, s) => acc + Number(s.valor || 0), 0);
        return { total, ativos, totalValor };
    }, [servicos]);

    function onChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function iniciarEdicao(servico) {
        setForm({
            clienteId: servico.cliente?.id ?? clienteSelecionado,
            nomeServico: servico.nomeServico || '',
            descricao: servico.descricao || '',
            valor: String(servico.valor || ''),
            status: servico.status || 'ativo',
            tipoCobranca: servico.tipoCobranca || 'avista',
            formaPagamento: servico.formaPagamento || '',
            numeroParcelas: String(servico.numeroParcelas || ''),
            dataInicio: servico.dataInicio || ''
        });
        setEditandoId(servico.id);
        setErro('');
        setOk('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelar() {
        setForm({ ...initialForm, clienteId: clienteSelecionado });
        setEditandoId(null);
        setErro('');
        setOk('');
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!form.clienteId) { setErro('Selecione um cliente.'); return; }
        if (!form.nomeServico.trim()) { setErro('Informe o nome do servico.'); return; }
        if (!form.valor || Number(form.valor) < 0) { setErro('Informe um valor valido.'); return; }
        if (form.tipoCobranca === 'parcelado') {
            if (!form.numeroParcelas || Number(form.numeroParcelas) < 2) {
                setErro('Informe o numero de parcelas (minimo 2).');
                return;
            }
            if (!form.formaPagamento) {
                setErro('Selecione como sera feito o pagamento parcelado.');
                return;
            }
        }

        setErro('');
        setOk('');
        setLoading(true);

        const payload = {
            clienteId: Number(form.clienteId),
            nomeServico: form.nomeServico.trim(),
            descricao: form.descricao.trim() || null,
            valor: Number(form.valor),
            status: form.status,
            tipoCobranca: form.tipoCobranca || 'avista',
            formaPagamento: form.tipoCobranca === 'parcelado' ? (form.formaPagamento || null) : null,
            numeroParcelas: form.tipoCobranca === 'parcelado' && form.numeroParcelas ? Number(form.numeroParcelas) : null,
            dataInicio: form.dataInicio || null
        };

        try {
            if (editandoId) {
                const { data } = await api.put(`/servicos/${editandoId}`, payload);
                setServicos((prev) => prev.map((s) => (s.id === data.id ? data : s)));
                await onServicosChange?.();
                setOk('Servico atualizado com sucesso.');
                cancelar();
            } else {
                const { data } = await api.post('/servicos', payload);
                if (String(data.cliente?.id) === String(clienteSelecionado)) {
                    setServicos((prev) => [data, ...prev]);
                }
                await onServicosChange?.();
                setForm({ ...initialForm, clienteId: clienteSelecionado });
                setOk('Servico cadastrado com sucesso.');
            }
        } catch (err) {
            const apiMsg = err?.response?.data;
            const mensagem =
                (typeof apiMsg === 'string' && apiMsg) ||
                apiMsg?.mensagem ||
                `Erro ${err?.response?.status || ''}`.trim() ||
                'Nao foi possivel salvar o servico.';
            setErro(mensagem);
        } finally {
            setLoading(false);
        }
    }

    async function excluir(id) {
        if (!window.confirm('Excluir este servico?')) return;
        try {
            await api.delete(`/servicos/${id}`);
            setServicos((prev) => prev.filter((s) => s.id !== id));
            await onServicosChange?.();
        } catch {
            setErro('Nao foi possivel excluir o servico.');
        }
    }

    return (
        <div className="content">
            {/* Formulário */}
            <div className="card">
                <div className="toolbar">
                    <h3>{editandoId ? 'Editar Servico' : 'Novo Servico'}</h3>
                    {editandoId && (
                        <button type="button" className="btn-cancel" onClick={cancelar}>Cancelar edicao</button>
                    )}
                </div>
                {erro && <div className="error">{erro}</div>}
                {ok && <div className="success">{ok}</div>}
                <form className="form-grid" onSubmit={onSubmit}>
                    <select
                        name="clienteId"
                        value={form.clienteId}
                        onChange={(e) => {
                            onChange(e);
                            if (!editandoId) setClienteSelecionado(e.target.value);
                        }}
                        required
                    >
                        <option value="">Selecione o cliente*</option>
                        {clientesAtivos.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` · ${c.empresa}` : ''}</option>
                        ))}
                    </select>

                    <input
                        name="nomeServico"
                        placeholder="Nome do servico*"
                        value={form.nomeServico}
                        onChange={onChange}
                        required
                    />

                    <input
                        name="valor"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Valor (R$)*"
                        value={form.valor}
                        onChange={onChange}
                        required
                    />

                    <select name="status" value={form.status} onChange={onChange}>
                        <option value="ativo">Ativo</option>
                        <option value="pausado">Pausado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                    <select name="tipoCobranca" value={form.tipoCobranca} onChange={onChange}>
                        <option value="avista">A vista (pagamento unico)</option>
                        <option value="parcelado">Parcelado</option>
                    </select>

                    {form.tipoCobranca === 'parcelado' && (
                        <>
                            <input
                                name="numeroParcelas"
                                type="number"
                                min="2"
                                max="120"
                                placeholder="Numero de parcelas*"
                                value={form.numeroParcelas}
                                onChange={onChange}
                            />
                            <select name="formaPagamento" value={form.formaPagamento} onChange={onChange}>
                                <option value="">Como sera cobrado?</option>
                                <option value="adiantado">Adiantado (tudo de uma vez)</option>
                                <option value="por_mes">Por mes (mensalidade)</option>
                            </select>
                        </>
                    )}

                    <input
                        name="dataInicio"
                        type="date"
                        placeholder="Data de inicio"
                        value={form.dataInicio}
                        onChange={onChange}
                    />

                    <textarea
                        name="descricao"
                        placeholder="Descricao do servico"
                        value={form.descricao}
                        onChange={onChange}
                        rows={3}
                    />

                    <button className="primary" disabled={loading} type="submit">
                        {loading ? 'Salvando...' : editandoId ? 'Salvar alteracoes' : 'Cadastrar Servico'}
                    </button>
                </form>
            </div>

            {/* Painel do cliente */}
            <div className="card">
                <div className="toolbar">
                    <h3>Servicos por Cliente</h3>
                    <select
                        className="etapas-cliente-select"
                        value={clienteSelecionado}
                        onChange={(e) => setClienteSelecionado(e.target.value)}
                    >
                        <option value="">Selecione um cliente</option>
                        {clientesAtivos.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` · ${c.empresa}` : ''}</option>
                        ))}
                    </select>
                </div>

                {clienteSelecionado && (
                    <div className="servicos-resumo-grid">
                        <div className="servico-resumo-tile">
                            <span>Total de servicos</span>
                            <strong>{resumo.total}</strong>
                        </div>
                        <div className="servico-resumo-tile">
                            <span>Servicos ativos</span>
                            <strong>{resumo.ativos}</strong>
                        </div>
                        <div className="servico-resumo-tile servico-resumo-tile--destaque">
                            <span>Receita ativa (total)</span>
                            <strong>{moeda(resumo.totalValor)}</strong>
                        </div>
                    </div>
                )}

                {loadingServicos && <p className="muted">Carregando servicos...</p>}

                {!loadingServicos && clienteSelecionado && (
                    <div className="servicos-grid">
                        {servicos.length === 0 ? (
                            <p className="muted">Nenhum servico cadastrado para este cliente.</p>
                        ) : (
                            servicos.map((s) => (
                                <article key={s.id} className={`servico-card servico-card--${s.status}`}>
                                    <div className="servico-card-top">
                                        <div>
                                            <h4>{s.nomeServico}</h4>
                                            {s.descricao && <p className="servico-desc">{s.descricao}</p>}
                                        </div>
                                        <span className={statusClass(s.status)}>{s.status}</span>
                                    </div>

                                    <div className="servico-card-valor">
                                        <strong>{moeda(s.valor)}</strong>
                                        {(() => {
                                            const info = pagamentoInfo(s);
                                            return <span className={`pagamento-tag ${info.cls}`}>{info.texto}</span>;
                                        })()}
                                        {s.dataInicio && (
                                            <span className="servico-data">desde {formatarData(s.dataInicio)}</span>
                                        )}
                                    </div>

                                    {(() => {
                                        const primeiro = primeiraEntradaMensal(s);
                                        if (!primeiro) return null;
                                        return (
                                            <span className="servico-data">
                                                Primeira entrada: {primeiro.toLocaleDateString('pt-BR')}
                                            </span>
                                        );
                                    })()}

                                    <div className="table-actions">
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            onClick={() => iniciarEdicao(s)}
                                            title="Editar servico"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-icon btn-icon-danger"
                                            onClick={() => excluir(s.id)}
                                            title="Excluir servico"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                )}

                {!clienteSelecionado && (
                    <p className="muted">Selecione um cliente para ver seus servicos.</p>
                )}
            </div>
        </div>
    );
}
