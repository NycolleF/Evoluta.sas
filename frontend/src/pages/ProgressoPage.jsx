import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

function formatarDataHora(valor) {
    if (!valor) return '-';
    return new Date(valor).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function ProgressoPage({ clientes }) {
    const [clienteId, setClienteId] = useState('');
    const [porcentagem, setPorcentagem] = useState(45);
    const [observacao, setObservacao] = useState('');
    const [progressoAtual, setProgressoAtual] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [ok, setOk] = useState('');

    const clientesOrdenados = useMemo(
        () => [...clientes].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')),
        [clientes]
    );

    async function carregar(clienteSelecionado) {
        if (!clienteSelecionado) {
            setProgressoAtual(null);
            setHistorico([]);
            return;
        }

        setCarregando(true);
        try {
            const [atualResp, historicoResp] = await Promise.all([
                api.get(`/progresso/${clienteSelecionado}`).catch(() => ({ data: null })),
                api.get(`/progresso/historico/${clienteSelecionado}`).catch(() => ({ data: [] }))
            ]);

            setProgressoAtual(atualResp.data || null);
            setHistorico(historicoResp.data || []);

            if (atualResp.data) {
                setPorcentagem(atualResp.data.porcentagem ?? 0);
                setObservacao(atualResp.data.observacao || '');
            } else {
                setPorcentagem(45);
                setObservacao('');
            }
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregar(clienteId);
    }, [clienteId]);

    async function onSubmit(event) {
        event.preventDefault();
        setErro('');
        setOk('');

        if (!clienteId) {
            setErro('Selecione o cliente.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/progresso', {
                clienteId: Number(clienteId),
                porcentagem: Number(porcentagem),
                observacao: observacao.trim() || null
            });

            setProgressoAtual(data);
            setOk('Progresso atualizado com sucesso.');
            await carregar(clienteId);
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao foi possivel atualizar o progresso.');
        } finally {
            setLoading(false);
        }
    }

    const variacao = historico.length > 1 ? historico[0].porcentagem - historico[1].porcentagem : 0;

    return (
        <div className="content">
            <div className="card progress-hero">
                <div>
                    <span className="page-kicker">Acompanhamento continuo</span>
                    <h3>Progresso por cliente</h3>
                    <p>Atualize o andamento da mentoria e acompanhe a trilha dos ultimos movimentos em uma linha do tempo simples.</p>
                </div>
                <select className="etapas-cliente-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                    <option value="">Selecionar cliente</option>
                    {clientesOrdenados.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                </select>
            </div>

            <div className="grid compact-grid">
                <article className="tile metric-tile">
                    <small>Progresso atual</small>
                    <strong>{progressoAtual?.porcentagem ?? 0}%</strong>
                </article>
                <article className="tile metric-tile">
                    <small>Variacao recente</small>
                    <strong>{variacao >= 0 ? '+' : ''}{variacao}%</strong>
                </article>
                <article className="tile metric-tile">
                    <small>Ultima atualizacao</small>
                    <strong>{progressoAtual?.dataAtualizacao ? formatarDataHora(progressoAtual.dataAtualizacao) : '-'}</strong>
                </article>
            </div>

            <div className="grid progress-grid">
                <div className="card">
                    <h3>Atualizar progresso</h3>
                    {erro ? <div className="error">{erro}</div> : null}
                    {ok ? <div className="success">{ok}</div> : null}

                    <form className="form-grid" onSubmit={onSubmit}>
                        <div className="progress-meter-card">
                            <div className="progress-meter-head">
                                <span>Percentual atual</span>
                                <strong>{porcentagem}%</strong>
                            </div>
                            <input
                                className="progress-range"
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={porcentagem}
                                onChange={(e) => setPorcentagem(e.target.value)}
                            />
                            <div className="etapas-progresso-bar large-progress-bar">
                                <div className="etapas-progresso-fill" style={{ width: `${porcentagem}%` }} />
                            </div>
                        </div>

                        <textarea
                            rows={4}
                            placeholder="Observacao sobre o momento do cliente"
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                        />

                        <button className="primary" type="submit" disabled={loading || !clienteId}>
                            {loading ? 'Salvando...' : 'Atualizar progresso'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3>Historico recente</h3>
                    {carregando ? <p className="muted">Carregando historico...</p> : null}
                    {!carregando && !clienteId ? <p className="muted">Selecione um cliente para ver o historico.</p> : null}
                    {!carregando && clienteId && historico.length === 0 ? <p className="muted">Ainda nao ha movimentacoes registradas.</p> : null}

                    {historico.length > 0 ? (
                        <div className="history-stack">
                            {historico.map((item) => (
                                <article key={item.id} className="history-card">
                                    <div className="history-card-top">
                                        <strong>{item.porcentagem}%</strong>
                                        <span>{formatarDataHora(item.dataReferencia)}</span>
                                    </div>
                                    <div className="etapas-progresso-bar">
                                        <div className="etapas-progresso-fill" style={{ width: `${item.porcentagem}%` }} />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}