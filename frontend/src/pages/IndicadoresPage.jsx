import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const initialForm = {
    clienteId: '',
    tipoKpi: '',
    valor: '',
    unidade: '',
    data: new Date().toISOString().slice(0, 10)
};

function formatarMoeda(valor, unidade) {
    const numero = Number(valor || 0);
    if ((unidade || '').toLowerCase() === 'r$') {
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return `${numero.toLocaleString('pt-BR')} ${unidade || ''}`.trim();
}

function formatarData(data) {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export default function IndicadoresPage({ clientes }) {
    const [form, setForm] = useState(initialForm);
    const [clienteSelecionado, setClienteSelecionado] = useState('');
    const [indicadores, setIndicadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [ok, setOk] = useState('');

    const clientesOrdenados = useMemo(
        () => [...clientes].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')),
        [clientes]
    );

    async function carregarIndicadores(clienteId) {
        if (!clienteId) {
            setIndicadores([]);
            return;
        }

        setCarregando(true);
        try {
            const { data } = await api.get('/indicadores', { params: { clienteId } });
            setIndicadores(data || []);
        } catch {
            setIndicadores([]);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarIndicadores(clienteSelecionado);
    }, [clienteSelecionado]);

    function onChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(event) {
        event.preventDefault();
        setErro('');
        setOk('');

        if (!form.clienteId) {
            setErro('Selecione o cliente.');
            return;
        }

        if (!form.tipoKpi.trim()) {
            setErro('Informe o nome do indicador.');
            return;
        }

        if (form.valor === '') {
            setErro('Informe o valor do indicador.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/indicadores', {
                clienteId: Number(form.clienteId),
                tipoKpi: form.tipoKpi.trim(),
                valor: Number(form.valor),
                unidade: form.unidade.trim() || null,
                data: form.data || null
            });

            setOk('Indicador salvo com sucesso.');
            setForm((prev) => ({ ...initialForm, clienteId: prev.clienteId, unidade: prev.unidade }));

            if (clienteSelecionado === form.clienteId) {
                carregarIndicadores(form.clienteId);
            } else {
                setClienteSelecionado(form.clienteId);
            }
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao foi possivel salvar o indicador.');
        } finally {
            setLoading(false);
        }
    }

    const resumo = useMemo(() => {
        if (indicadores.length === 0) {
            return { total: 0, media: 0, ultimo: null };
        }

        const total = indicadores.length;
        const soma = indicadores.reduce((acc, item) => acc + Number(item.valor || 0), 0);
        return {
            total,
            media: soma / total,
            ultimo: indicadores[0]
        };
    }, [indicadores]);

    return (
        <div className="content">
            <div className="card">
                <h3>Novo Indicador</h3>
                {erro ? <div className="error">{erro}</div> : null}
                {ok ? <div className="success">{ok}</div> : null}

                <form className="form-grid" onSubmit={onSubmit}>
                    <select name="clienteId" value={form.clienteId} onChange={onChange} required>
                        <option value="">Selecione o cliente</option>
                        {clientesOrdenados.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                        ))}
                    </select>

                    <div className="form-row">
                        <input name="tipoKpi" placeholder="Ex.: Ticket medio" value={form.tipoKpi} onChange={onChange} required />
                        <input name="valor" type="number" step="0.01" placeholder="Valor" value={form.valor} onChange={onChange} required />
                        <input name="unidade" placeholder="Unidade (%, R$, leads...)" value={form.unidade} onChange={onChange} />
                        <input name="data" type="date" value={form.data} onChange={onChange} />
                    </div>

                    <button className="primary" type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Registrar indicador'}
                    </button>
                </form>
            </div>

            <div className="card">
                <div className="toolbar">
                    <div>
                        <h3>Painel de KPIs</h3>
                        <span className="page-kicker">Leitura rapida do cliente</span>
                    </div>
                    <select className="etapas-cliente-select" value={clienteSelecionado} onChange={(e) => setClienteSelecionado(e.target.value)}>
                        <option value="">Selecionar cliente</option>
                        {clientesOrdenados.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="grid compact-grid">
                    <article className="tile metric-tile">
                        <small>Indicadores ativos</small>
                        <strong>{resumo.total}</strong>
                    </article>
                    <article className="tile metric-tile">
                        <small>Media registrada</small>
                        <strong>{resumo.total ? resumo.media.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '0'}</strong>
                    </article>
                    <article className="tile metric-tile">
                        <small>Ultimo lancamento</small>
                        <strong>{resumo.ultimo ? formatarData(resumo.ultimo.data) : '-'}</strong>
                    </article>
                </div>

                {carregando ? <p className="muted">Carregando indicadores...</p> : null}
                {!carregando && !clienteSelecionado ? <p className="muted">Escolha um cliente para acompanhar os KPIs.</p> : null}
                {!carregando && clienteSelecionado && indicadores.length === 0 ? <p className="muted">Nenhum indicador registrado para este cliente.</p> : null}

                {indicadores.length > 0 ? (
                    <div className="kpi-stack">
                        {indicadores.slice(0, 4).map((indicador) => (
                            <article key={indicador.id} className="kpi-card">
                                <span>{indicador.tipoKpi}</span>
                                <strong>{formatarMoeda(indicador.valor, indicador.unidade)}</strong>
                                <small>{formatarData(indicador.data)}</small>
                            </article>
                        ))}
                    </div>
                ) : null}

                {indicadores.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Indicador</th>
                                <th>Valor</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {indicadores.map((indicador) => (
                                <tr key={indicador.id}>
                                    <td>{indicador.tipoKpi}</td>
                                    <td>{formatarMoeda(indicador.valor, indicador.unidade)}</td>
                                    <td>{formatarData(indicador.data)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : null}
            </div>
        </div>
    );
}