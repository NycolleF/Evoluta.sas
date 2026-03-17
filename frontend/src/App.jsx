import { useEffect, useState } from 'react';
import { api } from './services/api';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import NovaDemandaPage from './pages/NovaDemandaPage';
import ReunioesPage from './pages/ReunioesPage';
import CalendarioPage from './pages/CalendarioPage';

export default function App() {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('evoluta_user');
        return raw ? JSON.parse(raw) : null;
    });
    const [hash, setHash] = useState(window.location.hash || '#dashboard');
    const [resumo, setResumo] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('evoluta_theme');
        return saved || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('evoluta_theme', theme);
    }, [theme]);

    async function carregarDados() {
        try {
            const [resumoResp, clientesResp] = await Promise.all([
                api.get('/dashboard/resumo'),
                api.get('/clientes')
            ]);
            setResumo(resumoResp.data);
            setClientes(clientesResp.data);
        } catch {
            setResumo(null);
            setClientes([]);
        }
    }

    useEffect(() => {
        const onHash = () => setHash(window.location.hash || '#dashboard');
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    useEffect(() => {
        if (!user) return;
        carregarDados();
    }, [user]);

    function handleClienteCriado(cliente) {
        setClientes((prev) => [cliente, ...prev]);
        setResumo((prev) => {
            if (!prev) return prev;
            const ativo = cliente.status === 'ativo' ? (prev.ativos || 0) + 1 : prev.ativos || 0;
            const pausados = cliente.status === 'pausado' ? (prev.pausados || 0) + 1 : prev.pausados || 0;
            const finalizados = cliente.status === 'finalizado' ? (prev.finalizados || 0) + 1 : prev.finalizados || 0;
            return {
                ...prev,
                totalClientes: (prev.totalClientes || 0) + 1,
                ativos: ativo,
                pausados,
                finalizados
            };
        });
    }

    function handleDemandaCriada() {
        carregarDados();
        window.location.hash = '#dashboard';
    }

    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    function handleLogin(data) {
        const u = { id: data.usuarioId, nome: data.nome, email: data.email };
        localStorage.setItem('evoluta_user', JSON.stringify(u));
        setUser(u);
        window.location.hash = '#dashboard';
    }

    function logout() {
        localStorage.removeItem('evoluta_user');
        setUser(null);
    }

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const pageTitle =
        hash === '#cadastro-cliente'
            ? 'Cadastro de Cliente'
            : hash === '#nova-demanda'
                ? 'Criar Demanda'
                : hash === '#reunioes'
                    ? 'Reunioes e Anotacoes'
                    : hash === '#calendario'
                        ? 'Calendario de Reunioes'
                        : 'Demandas do Dia';

    return (
        <Layout user={user} onLogout={logout} pageTitle={pageTitle} theme={theme} onToggleTheme={toggleTheme} activeHash={hash}>
            {hash === '#cadastro-cliente' ? (
                <ClientesPage clientes={clientes} onClienteCriado={handleClienteCriado} />
            ) : hash === '#nova-demanda' ? (
                <NovaDemandaPage clientes={clientes} onDemandaCriada={handleDemandaCriada} />
            ) : hash === '#reunioes' ? (
                <ReunioesPage clientes={clientes} />
            ) : hash === '#calendario' ? (
                <CalendarioPage />
            ) : (
                <DashboardPage resumo={resumo} />
            )}
        </Layout>
    );
}
