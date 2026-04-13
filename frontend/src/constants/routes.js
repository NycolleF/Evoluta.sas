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
    [ROUTES.REUNIOES]: 'Reuniões e Anotações',
    [ROUTES.CALENDARIO]: 'Calendário de Reuniões',
    [ROUTES.DASHBOARD]: 'Demandas do Dia'
};

export const MENU_ITEMS = [
    { href: ROUTES.DASHBOARD, label: 'Principal', icon: '◌' },
    { href: ROUTES.CADASTRO_CLIENTE, label: 'Clientes', icon: '◫' },
    { href: ROUTES.NOVA_DEMANDA, label: 'Criar demanda', icon: '✦' },
    { href: ROUTES.REUNIOES, label: 'Reuniões', icon: '◍' },
    { href: ROUTES.CALENDARIO, label: 'Calendário', icon: '▣' }
];
