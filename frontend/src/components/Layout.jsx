import { MENU_ITEMS } from '../constants/routes';

function navClass(currentHash, targetHash) {
    return currentHash === targetHash ? 'is-active' : '';
}

export default function Layout({ user, onLogout, children, pageTitle, theme, onToggleTheme, activeHash }) {
    return (
        <div className="app-shell">
            <aside className="side">
                <div className="brand">
                    <div className="leaf">🌿</div>
                    <h1>Evoluta</h1>
                    <p>Gestao de mentoria com foco em rotina, demandas e reunioes.</p>
                </div>
                <div className="side-scroll">
                    <div className="side-box">
                        <span className="side-box-title">Navegacao</span>
                        <nav className="menu">
                            {MENU_ITEMS.map((item) => (
                                <a key={item.href} className={navClass(activeHash, item.href)} href={item.href}>
                                    <span className="menu-link-inner">
                                        <span className="menu-icon" aria-hidden="true">{item.icon}</span>
                                        <span className="menu-text">{item.label}</span>
                                    </span>
                                    <span className="menu-arrow" aria-hidden="true">›</span>
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="profile side-box">
                        <span className="side-box-title">Conta</span>
                        <strong>{user?.nome}</strong>
                        <span>{user?.email}</span>
                        <button onClick={onToggleTheme} className="secondary-btn" type="button">
                            Alternar para tema {theme === 'light' ? 'escuro' : 'claro'}
                        </button>
                        <button onClick={onLogout} className="secondary-btn logout-btn" type="button">Sair</button>
                    </div>
                </div>
            </aside>
            <main className="main">
                <header className="top">
                    <div>
                        <span className="page-kicker">Painel Evoluta</span>
                        <h2>{pageTitle}</h2>
                    </div>
                    <div className="top-meta">
                        <span className="theme-pill">Tema {theme === 'light' ? 'claro' : 'escuro'}</span>
                    </div>
                </header>
                <section className="content">{children}</section>
            </main>
        </div>
    );
}
