import { useEffect, useState } from 'react';

function navClass(currentHash, targetHash) {
    return currentHash === targetHash ? 'is-active' : '';
}

const menuItems = [
    { href: '#dashboard', label: 'Principal', icon: '◌' },
    { href: '#cadastro-cliente', label: 'Clientes', icon: '◫' },
    { href: '#nova-demanda', label: 'Criar Demanda', icon: '✦' },
    { href: '#etapas', label: 'Etapas', icon: '◈' },
    { href: '#reunioes', label: 'Reunioes', icon: '◍' },
    { href: '#calendario', label: 'Calendario', icon: '▣' }
];

export default function Layout({ user, onLogout, children, pageTitle, theme, onToggleTheme, activeHash }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [sideCollapsed, setSideCollapsed] = useState(() => localStorage.getItem('evoluta_side_collapsed') === '1');

    useEffect(() => {
        setMenuOpen(false);
    }, [activeHash]);

    useEffect(() => {
        function onEsc(event) {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        }
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, []);

    useEffect(() => {
        localStorage.setItem('evoluta_side_collapsed', sideCollapsed ? '1' : '0');
    }, [sideCollapsed]);

    const paginaAtual = menuItems.find((item) => item.href === activeHash)?.label || 'Navegacao';
    const iniciaisUsuario = (user?.nome || 'E')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase())
        .join('');

    return (
        <div className={`app-shell ${sideCollapsed ? 'side-collapsed' : ''}`}>
            <button
                type="button"
                className={`menu-overlay ${menuOpen ? 'is-open' : ''}`}
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
            />

            <aside className={`side ${menuOpen ? 'is-open' : ''}`}>
                <div className="brand">
                    <div className="brand-top">
                        <div className="leaf">🌿</div>
                        <button
                            type="button"
                            className="side-collapse-btn"
                            onClick={() => setSideCollapsed((prev) => !prev)}
                            aria-label={sideCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
                            title={sideCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
                        >
                            {sideCollapsed ? '»' : '«'}
                        </button>
                    </div>
                    <h1>Evoluta</h1>
                    <p>Gestao de mentoria com foco em rotina, demandas e reunioes.</p>
                </div>
                <div className="side-scroll">
                    <div className="side-box">
                        <span className="side-box-title">Navegacao</span>
                        <nav className="menu" id="menu-principal">
                            {menuItems.map((item) => (
                                <a
                                    key={item.href}
                                    className={navClass(activeHash, item.href)}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    aria-current={activeHash === item.href ? 'page' : undefined}
                                    title={item.label}
                                >
                                    <span className="menu-link-inner">
                                        <span className="menu-icon" aria-hidden="true">{item.icon}</span>
                                        <span className="menu-text">{item.label}</span>
                                    </span>
                                    <span className="menu-arrow" aria-hidden="true">›</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="profile side-box">
                    <span className="side-box-title">Conta</span>
                    <div className="profile-header">
                        <div className="profile-avatar" aria-hidden="true">{iniciaisUsuario}</div>
                        <div className="profile-copy">
                            <strong>{user?.nome}</strong>
                            <span>{user?.email}</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="secondary-btn logout-btn" type="button">Sair</button>
                </div>
            </aside>
            <main className="main">
                <header className="top">
                    <div className="top-left">
                        <button
                            type="button"
                            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Abrir menu de paginas"
                            aria-expanded={menuOpen}
                            aria-controls="menu-principal"
                        >
                            <span className="menu-toggle-lines" aria-hidden="true" />
                            <span className="menu-toggle-text">{paginaAtual}</span>
                        </button>
                        <span className="page-kicker">Painel Evoluta</span>
                        <h2>{pageTitle}</h2>
                    </div>
                    <div className="top-meta">
                        <button type="button" className="theme-pill theme-toggle" onClick={onToggleTheme}>
                            Tema {theme === 'light' ? 'claro' : 'escuro'}
                        </button>
                    </div>
                </header>
                <section className="content">{children}</section>
            </main>
        </div>
    );
}
