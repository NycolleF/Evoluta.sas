-- ============================================
-- EVOLUTA CLIENT MANAGER - Schema do Banco
-- ============================================

CREATE DATABASE IF NOT EXISTS evoluta_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE evoluta_db;

-- Tabela de usuários (sistema de login)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    empresa VARCHAR(150),
    contato VARCHAR(20),
    email VARCHAR(150),
    status ENUM('ativo', 'pausado', 'finalizado') DEFAULT 'ativo',
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de etapas da mentoria
CREATE TABLE IF NOT EXISTS etapas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nome_etapa VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo ENUM('diagnostico', 'planejamento', 'execucao', 'avaliacao', 'outro') DEFAULT 'outro',
    data_etapa DATE,
    status ENUM('pendente', 'em_andamento', 'concluida') DEFAULT 'pendente',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de arquivos por etapa
CREATE TABLE IF NOT EXISTS arquivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etapa_id INT NOT NULL,
    nome_original VARCHAR(250) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tamanho INT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etapa_id) REFERENCES etapas(id) ON DELETE CASCADE
);

-- Tabela de progresso do cliente
CREATE TABLE IF NOT EXISTS progresso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    porcentagem TINYINT UNSIGNED DEFAULT 0,
    observacao VARCHAR(255),
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de histórico de progresso (tendência mensal)
CREATE TABLE IF NOT EXISTS progresso_historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    porcentagem TINYINT UNSIGNED DEFAULT 0,
    data_referencia DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_progresso_hist_cliente_data (cliente_id, data_referencia),
    INDEX idx_progresso_hist_data (data_referencia)
);

-- Tabela de KPIs / Indicadores
CREATE TABLE IF NOT EXISTS indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo_kpi VARCHAR(100) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    unidade VARCHAR(30),
    data DATE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de demandas do cliente (agenda diaria)
CREATE TABLE IF NOT EXISTS demandas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_demanda DATE NOT NULL,
    prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'media',
    status ENUM('pendente', 'em_andamento', 'concluida') DEFAULT 'pendente',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_demandas_data (data_demanda),
    INDEX idx_demandas_cliente_data (cliente_id, data_demanda)
);

-- Tabela de reunioes e anotacoes
CREATE TABLE IF NOT EXISTS reunioes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    data_reuniao DATE NOT NULL,
    anotacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_reunioes_data (data_reuniao),
    INDEX idx_reunioes_cliente_data (cliente_id, data_reuniao)
);

-- Tabela de anexos de reuniao
CREATE TABLE IF NOT EXISTS reuniao_arquivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reuniao_id INT NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    nome_armazenado VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(120),
    tamanho BIGINT,
    FOREIGN KEY (reuniao_id) REFERENCES reunioes(id) ON DELETE CASCADE
);

-- Tabela de serviços e valores por cliente
CREATE TABLE IF NOT EXISTS servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nome_servico VARCHAR(200) NOT NULL,
    descricao TEXT,
    valor DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('ativo', 'pausado', 'cancelado') DEFAULT 'ativo',
    tipo_cobranca ENUM('avista', 'parcelado') DEFAULT 'avista',
    forma_pagamento ENUM('adiantado', 'por_mes') DEFAULT NULL,
    numero_parcelas INT DEFAULT NULL,
    data_inicio DATE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_servicos_cliente (cliente_id)
);

-- Tabela de relatórios gerados
CREATE TABLE IF NOT EXISTS relatorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    titulo VARCHAR(200),
    caminho_pdf VARCHAR(500),
    token_compartilhamento VARCHAR(64),
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Usuário padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha) VALUES (
    'Deborah Fiussen',
    'deborah@evoluta.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
) ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Dados de demonstracao para visualizacao
INSERT INTO clientes (nome, empresa, contato, email, status, observacoes)
SELECT 'Academia Movimento', 'Academia Movimento', 'Joao Pedro', 'joao@movimento.com', 'ativo', 'Cliente de demonstracao'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nome = 'Academia Movimento');

INSERT INTO clientes (nome, empresa, contato, email, status, observacoes)
SELECT 'Pet Shop Mundo Animal', 'Pet Shop Mundo Animal', 'Fernanda Lima', 'fernanda@mundopet.com', 'ativo', 'Cliente de demonstracao'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nome = 'Pet Shop Mundo Animal');

INSERT INTO clientes (nome, empresa, contato, email, status, observacoes)
SELECT 'Bistro Sabor da Serra', 'Bistro Sabor da Serra', 'Luciana Gomes', 'luciana@serra.com', 'ativo', 'Cliente de demonstracao'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nome = 'Bistro Sabor da Serra');

INSERT INTO reunioes (cliente_id, data_reuniao, anotacoes)
SELECT c.id, CURDATE(), 'Reuniao de alinhamento inicial com definicao de prioridades da semana.'
FROM clientes c
WHERE c.nome = 'Academia Movimento'
AND NOT EXISTS (
    SELECT 1 FROM reunioes r WHERE r.cliente_id = c.id AND r.data_reuniao = CURDATE()
);

INSERT INTO reunioes (cliente_id, data_reuniao, anotacoes)
SELECT c.id, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Revisao da rotina comercial e acompanhamento de indicadores principais.'
FROM clientes c
WHERE c.nome = 'Pet Shop Mundo Animal'
AND NOT EXISTS (
    SELECT 1 FROM reunioes r WHERE r.cliente_id = c.id AND r.data_reuniao = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
);

INSERT INTO reunioes (cliente_id, data_reuniao, anotacoes)
SELECT c.id, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Planejamento de campanha mensal e agenda de comunicacao com clientes.'
FROM clientes c
WHERE c.nome = 'Bistro Sabor da Serra'
AND NOT EXISTS (
    SELECT 1 FROM reunioes r WHERE r.cliente_id = c.id AND r.data_reuniao = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
);
