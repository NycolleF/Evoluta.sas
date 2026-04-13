import { useState } from 'react';
import { api } from '../services/api';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
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
            setErro(err?.response?.data?.mensagem || 'Falha no login.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-bg">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1>Evoluta</h1>
                <p>Acesse o painel da sua mentoria</p>
                {erro ? <div className="error">{erro}</div> : null}
                <label>E-mail</label>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    required
                />
                <label>Senha</label>
                <input
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    required
                />
                <button disabled={loading} type="submit">{loading ? 'Entrando...' : 'Entrar'}</button>
            </form>
        </div>
    );
}
