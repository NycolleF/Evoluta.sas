import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import SearchField from '../components/SearchField';

function hojeISO() {
    const dt = new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function mesAtualISO() {
    return hojeISO().slice(0, 7);
}

function formatarData(data) {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export default function ReunioesPage({ clientes }) {
    const [form, setForm] = useState({
        clienteId: '',
        dataReuniao: hojeISO(),
        anotacoes: '',
        arquivos: []
    });
    const [buscaCliente, setBuscaCliente] = useState('');
    const [mesFiltro, setMesFiltro] = useState(mesAtualISO());
    const [clienteRelatorio, setClienteRelatorio] = useState('');
    const [reunioes, setReunioes] = useState([]);
    const [erro, setErro] = useState('');
    const [ok, setOk] = useState('');
    const [loading, setLoading] = useState(false);
    const [carregandoLista, setCarregandoLista] = useState(false);

    const clientesOrdenados = useMemo(
        () => [...clientes].sort((a, b) => (a.nome || '').localeCompare(b.nome || '')),
        [clientes]
    );

    const clientesFiltrados = useMemo(() => {
        const termo = buscaCliente.trim().toLowerCase();
        if (!termo) return clientesOrdenados;
        return clientesOrdenados.filter((c) => {
            const nome = (c.nome || '').toLowerCase();
            const contato = String(c.contato || '').toLowerCase();
            return nome.includes(termo) || contato.includes(termo);
        });
    }, [clientesOrdenados, buscaCliente]);

    async function carregarReunioes(mes = mesFiltro) {
        setCarregandoLista(true);
        try {
            const resp = await api.get(`/reunioes?mes=${mes}`);
            setReunioes(resp.data || []);
        } catch {
            setReunioes([]);
        } finally {
            setCarregandoLista(false);
        }
    }

    useEffect(() => {
        carregarReunioes(mesFiltro);
    }, []);

    useEffect(() => {
        if (!clienteRelatorio && clientesOrdenados.length > 0) {
            setClienteRelatorio(String(clientesOrdenados[0].id));
        }
    }, [clientesOrdenados, clienteRelatorio]);

    function handleInputChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleFilesChange(e) {
        const files = Array.from(e.target.files || []);
        setForm((prev) => ({ ...prev, arquivos: files }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        setOk('');

        if (!form.clienteId) {
            setErro('Selecione o cliente.');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('clienteId', form.clienteId);
            data.append('dataReuniao', form.dataReuniao);
            data.append('anotacoes', form.anotacoes || '');
            form.arquivos.forEach((arquivo) => data.append('arquivos', arquivo));

            await api.post('/reunioes', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setOk('Reuniao salva com sucesso.');
            setForm((prev) => ({
                ...prev,
                anotacoes: '',
                arquivos: []
            }));
            carregarReunioes(mesFiltro);
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao foi possivel salvar a reuniao.');
        } finally {
            setLoading(false);
        }
    }

    function handleMonthChange(e) {
        const novoMes = e.target.value;
        setMesFiltro(novoMes);
        carregarReunioes(novoMes);
    }

    function gerarRelatorioPdf() {
        const id = clienteRelatorio || form.clienteId;
        if (!id) {
            setErro('Selecione um cliente para gerar o relatorio.');
            return;
        }

        const base = api.defaults.baseURL || 'http://localhost:8081/api';
        const url = `${base}/reunioes/relatorio-pdf?clienteId=${id}&mes=${mesFiltro}`;
        window.open(url, '_blank');
    }

    return (
        <div className="content">
            <div className="card">
                <h3>Registro de Reuniao</h3>
                {erro ? <div className="error">{erro}</div> : null}
                {ok ? <div className="success">{ok}</div> : null}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <SearchField
                        name="buscaCliente"
                        placeholder="Buscar cliente por nome ou telefone"
                        value={buscaCliente}
                        onChange={(e) => setBuscaCliente(e.target.value)}
                    />

                    <select name="clienteId" value={form.clienteId} onChange={handleInputChange} required>
                        <option value="">Selecione o cliente</option>
                        {clientesFiltrados.map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}{c.contato ? ` - ${c.contato}` : ''}</option>
                        ))}
                    </select>

                    <input type="date" name="dataReuniao" value={form.dataReuniao} onChange={handleInputChange} required />
                    <textarea
                        name="anotacoes"
                        rows={5}
                        placeholder="Anotacoes da reuniao"
                        value={form.anotacoes}
                        onChange={handleInputChange}
                    />
                    <input type="file" multiple accept="application/pdf,image/*" onChange={handleFilesChange} />
                    <button className="primary" disabled={loading} type="submit">
                        {loading ? 'Salvando...' : 'Salvar Reuniao'}
                    </button>
                </form>
            </div>

            <div className="card">
                <div className="toolbar">
                    <h3>Reunioes do Mes</h3>
                    <div className="toolbar-actions">
                        <input type="month" value={mesFiltro} onChange={handleMonthChange} />
                        <select value={clienteRelatorio} onChange={(e) => setClienteRelatorio(e.target.value)}>
                            <option value="">Cliente para relatorio</option>
                            {clientesOrdenados.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                        <button type="button" className="primary" onClick={gerarRelatorioPdf}>Baixar PDF</button>
                    </div>
                </div>

                {carregandoLista ? <p>Carregando...</p> : null}
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Anotacoes</th>
                            <th>Anexos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reunioes.length === 0 ? (
                            <tr>
                                <td colSpan={4}>Nenhuma reuniao neste mes.</td>
                            </tr>
                        ) : (
                            reunioes.map((r) => (
                                <tr key={r.id}>
                                    <td>{formatarData(r.dataReuniao)}</td>
                                    <td>{r.cliente?.nome || '-'}</td>
                                    <td>{r.anotacoes || '-'}</td>
                                    <td>
                                        {r.arquivos?.length ? (
                                            <div className="anexos-inline">
                                                {r.arquivos.map((a) => (
                                                    <a key={a.id} href={`http://localhost:8081/api/reunioes/arquivos/${a.id}`} target="_blank" rel="noreferrer">
                                                        {a.nomeOriginal}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : 'Sem anexos'}
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
