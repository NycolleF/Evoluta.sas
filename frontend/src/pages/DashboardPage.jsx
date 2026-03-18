function badgeClass(value) {
    const raw = String(value || '').toLowerCase();
    if (raw.includes('alta') || raw.includes('ativo') || raw.includes('conclu')) return 'badge badge-positive';
    if (raw.includes('andamento') || raw.includes('media')) return 'badge badge-warning';
    if (raw.includes('pendente') || raw.includes('pausado') || raw.includes('baixa')) return 'badge badge-neutral';
    if (raw.includes('finalizado')) return 'badge badge-dark';
    return 'badge';
}

export default function DashboardPage({ resumo }) {
    const demandas = resumo?.demandasHoje || [];

    return (
        <div className="content">
            <section className="hero-card">
                <div>
                    <span className="page-kicker">Resumo de hoje</span>
                    <h3>Visao rapida da operacao</h3>
                    <p>Acompanhe clientes ativos, demandas prioritarias e o ritmo geral do dia em um unico painel.</p>
                </div>
            </section>

            <div className="grid">
                <article className="tile">
                    <small>Total clientes</small>
                    <strong>{resumo?.totalClientes ?? 0}</strong>
                </article>
                <article className="tile">
                    <small>Ativos</small>
                    <strong>{resumo?.ativos ?? 0}</strong>
                </article>
                <article className="tile">
                    <small>Demandas hoje</small>
                    <strong>{resumo?.totalDemandasHoje ?? 0}</strong>
                </article>
                <article className="tile">
                    <small>Progresso medio</small>
                    <strong>{resumo?.progressoMedio ?? 0}%</strong>
                </article>
            </div>

            <div className="card">
                <h3>Demandas do dia por cliente</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Demanda</th>
                            <th>Prioridade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {demandas.length === 0 ? (
                            <tr>
                                <td colSpan={4}>Nenhuma demanda para hoje.</td>
                            </tr>
                        ) : (
                            demandas.map((d) => (
                                <tr key={d.id}>
                                    <td>{d.cliente?.nome || '-'}</td>
                                    <td>{d.titulo}</td>
                                    <td><span className={badgeClass(d.prioridade)}>{d.prioridade}</span></td>
                                    <td><span className={badgeClass(d.status)}>{d.status}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
