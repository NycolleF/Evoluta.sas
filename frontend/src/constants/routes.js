export const ROUTES = {
    DASHBOARD: '#dashboard',
    CADASTRO_CLIENTE: '#cadastro-cliente',
    NOVA_DEMANDA: '#nova-demanda',
    REUNIOES: '#reunioes',
    CALENDARIO: '#calendario'
};

export const PAGE_TITLES = {
    [ROUTES.CADASTRO_CLIENTE]: 'Cadastro de Cliente',
    [ROUTES.NOVA_DEMANDA]: 'Criar Demanda',
    [ROUTES.REUNIOES]: 'Reunioes e Anotacoes',
    [ROUTES.CALENDARIO]: 'Calendario de Reunioes',
    [ROUTES.DASHBOARD]: 'Demandas do Dia'
};

export const MENU_ITEMS = [
    { href: ROUTES.DASHBOARD, label: 'Principal', icon: '◌' },
    { href: ROUTES.CADASTRO_CLIENTE, label: 'Cadastro Cliente', icon: '◫' },
    { href: ROUTES.NOVA_DEMANDA, label: 'Criar Demanda', icon: '✦' },
    { href: ROUTES.REUNIOES, label: 'Reunioes', icon: '◍' },
    { href: ROUTES.CALENDARIO, label: 'Calendario', icon: '▣' }
];
