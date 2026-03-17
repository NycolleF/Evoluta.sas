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

export default function ClientesPage({ clientes, onClienteCriado }) {
    const [form, setForm] = useState(initialForm);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

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

    async function onSubmit(e) {
        e.preventDefault();
        if (!form.nome.trim()) {
            setErro('Informe o nome do cliente.');
            return;
        }

        setErro('');
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

            const { data } = await api.post('/clientes', payload);
            setForm(initialForm);
            onClienteCriado?.(data);
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao foi possivel cadastrar o cliente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="content">
            <div className="card">
                <h3>Novo Cliente</h3>
                {erro ? <div className="error">{erro}</div> : null}
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
                        {loading ? 'Salvando...' : 'Cadastrar Cliente'}
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
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={4}>Nenhum cliente encontrado.</td>
                            </tr>
                        ) : (
                            clientesFiltrados.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.nome}</td>
                                    <td>{c.empresa || '-'}</td>
                                    <td>{c.contato || c.email || '-'}</td>
                                    <td><span className={statusClass(c.status)}>{c.status}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
