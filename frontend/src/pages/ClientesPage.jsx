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

export default function ClientesPage({ clientes, onClienteCriado, onClienteAtualizado }) {
    const [form, setForm] = useState(initialForm);
    const [editandoId, setEditandoId] = useState(null);
    const [busca, setBusca] = useState('');
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

    function cancelarEdicao() {
        setForm(initialForm);
        setEditandoId(null);
        setErro('');
        setOk('');
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
                cancelarEdicao();
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
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            onClick={() => iniciarEdicao(c)}
                                            title="Editar cliente"
                                            aria-label={`Editar ${c.nome}`}
                                        >
                                            ✎
                                        </button>
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
