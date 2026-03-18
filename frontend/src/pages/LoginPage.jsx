import { useState } from 'react';
import { api } from '../services/api';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('deborah@evoluta.com');
    const [senha, setSenha] = useState('password');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, senha });
            onLogin(data);
        } catch (err) {
            setErro(err?.response?.data?.mensagem || 'Nao foi possivel entrar agora. Confira seus dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-bg">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1>Evoluta</h1>
                <p>Bem-vinda! Acesse seu painel para acompanhar clientes, demandas e reunioes.</p>
                {erro ? <div className="error">{erro}</div> : null}
                <label>E-mail</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
                <label>Senha</label>
                <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" required />
                <button disabled={loading} type="submit">{loading ? 'Entrando...' : 'Entrar'}</button>
            </form>
        </div>
    );
}
