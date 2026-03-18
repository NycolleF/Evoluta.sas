import { useMemo, useState } from 'react';
import { api } from '../services/api';
import SearchField from '../components/SearchField';

function hojeISO() {
    const dt = new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const initial = {
    clienteId: '',
    titulo: '',
    descricao: '',
    dataDemanda: hojeISO(),
    prioridade: 'media',
    status: 'pendente'
};

export default function NovaDemandaPage({ clientes, onDemandaCriada }) {
    const [form, setForm] = useState(initial);
    const [buscaCliente, setBuscaCliente] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [ok, setOk] = useState('');

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

    function onChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErro('');
        setOk('');

        if (!form.clienteId) {
            setErro('Selecione um cliente.');
            return;
        }

        if (!form.titulo.trim()) {
            setErro('Informe o titulo da demanda.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/demandas', {
                ...form,
                clienteId: Number(form.clienteId),
                titulo: form.titulo.trim(),
                descricao: form.descricao.trim() || null
            });

            setForm({ ...initial, clienteId: form.clienteId });
            setOk('Demanda criada com sucesso!');
            onDemandaCriada?.();
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao conseguimos criar a demanda agora. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card">
            <h3>Nova Demanda</h3>
            {erro ? <div className="error">{erro}</div> : null}
            {ok ? <div className="success">{ok}</div> : null}

            <form className="form-grid" onSubmit={onSubmit}>
                <SearchField
                    name="buscaCliente"
                    placeholder="Buscar cliente por nome ou telefone"
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                />

                <select name="clienteId" value={form.clienteId} onChange={onChange} required>
                    <option value="">Selecione o cliente</option>
                    {clientesFiltrados.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}{c.contato ? ` - ${c.contato}` : ''}</option>
                    ))}
                </select>

                <input name="titulo" placeholder="Titulo da demanda*" value={form.titulo} onChange={onChange} required />
                <textarea name="descricao" rows={4} placeholder="Descricao" value={form.descricao} onChange={onChange} />

                <input name="dataDemanda" type="date" value={form.dataDemanda} onChange={onChange} required />

                <select name="prioridade" value={form.prioridade} onChange={onChange}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>

                <select name="status" value={form.status} onChange={onChange}>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluida">Concluida</option>
                </select>

                <button className="primary" disabled={loading} type="submit">
                    {loading ? 'Salvando...' : 'Criar Demanda'}
                </button>
            </form>
        </div>
    );
}
