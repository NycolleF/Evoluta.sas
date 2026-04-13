import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function mesHoje() {
    const dt = new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function formatarDia(isoDate) {
    return Number(isoDate.split('-')[2]);
}

function hojeMesDia() {
    const dt = new Date();
    return {
        y: dt.getFullYear(),
        m: dt.getMonth() + 1,
        d: dt.getDate()
    };
}

export default function CalendarioPage() {
    const [mes, setMes] = useState(mesHoje());
    const [reunioes, setReunioes] = useState([]);

    useEffect(() => {
        async function carregar() {
            try {
                const resp = await api.get(`/reunioes?mes=${mes}`);
                setReunioes(resp.data || []);
            } catch {
                setReunioes([]);
            }
        }
        carregar();
    }, [mes]);

    const porDia = useMemo(() => {
        const map = new Map();
        for (const r of reunioes) {
            const dia = formatarDia(r.dataReuniao);
            if (!map.has(dia)) map.set(dia, []);
            map.get(dia).push(r);
        }
        return map;
    }, [reunioes]);

    const diasDoMes = useMemo(() => {
        const [ano, mesNum] = mes.split('-').map(Number);
        const total = new Date(ano, mesNum, 0).getDate();
        const primeiroDia = new Date(ano, mesNum - 1, 1).getDay();
        const lista = [];

        for (let i = 0; i < primeiroDia; i++) {
            lista.push(null);
        }

        for (let dia = 1; dia <= total; dia++) {
            lista.push(dia);
        }

        return lista;
    }, [mes]);

    const hoje = useMemo(() => hojeMesDia(), []);
    const [anoAtual, mesAtual] = mes.split('-').map(Number);

    return (
        <div className="card calendar-card">
            <div className="toolbar">
                <h3>Calendário de reuniões</h3>
                <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
            </div>

            <div className="calendar-weekdays">
                {DIAS_SEMANA.map((dia) => (
                    <span key={dia}>{dia}</span>
                ))}
            </div>

            <div className="calendar-grid">
                {diasDoMes.map((dia, index) => (
                    dia === null ? (
                        <div className="calendar-empty" key={`empty-${index}`} />
                    ) : (
                        <article
                            className={`calendar-day ${anoAtual === hoje.y && mesAtual === hoje.m && dia === hoje.d ? 'today' : ''}`}
                            key={dia}
                        >
                            <strong>{dia}</strong>
                            {porDia.get(dia)?.length ? (
                                <div className="calendar-items">
                                    {porDia.get(dia).map((r) => (
                                        <p key={r.id}>
                                            <span>{r.cliente?.nome}</span>
                                            <small>{(r.anotacoes || '').slice(0, 58) || 'Reunião'}</small>
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <span className="muted">Sem reuniões</span>
                            )}
                        </article>
                    )
                ))}
            </div>
        </div>
    );
}
