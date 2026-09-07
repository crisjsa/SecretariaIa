-- ================================================================
-- SECRETARIA ELETRÔNICA DE IA — ESTÉTICA
-- Script completo de criação do banco de dados
-- Supabase / PostgreSQL
-- Versão 4.0 — Multi-tenant + Pacotes + Auth + Agenda avançada
--
-- INSTRUÇÕES:
-- 1. Acesse o painel do Supabase → SQL Editor
-- 2. Cole este script inteiro e clique em Run
-- 3. Todas as tabelas, funções e views serão criadas
-- ================================================================

-- ── EXTENSÕES ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- para hash de senhas e gen_random_uuid()

-- ================================================================
-- BLOCO 1 — PLATAFORMA (tabelas globais, não isoladas por clínica)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- TABELA: usuarios
-- Donos das clínicas (quem faz login no painel)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome                TEXT NOT NULL,
    email               TEXT UNIQUE NOT NULL,
    senha_hash          TEXT,                        -- bcrypt; NULL quando usa Google OAuth
    google_id           TEXT UNIQUE,                 -- ID retornado pelo Google OAuth
    avatar_url          TEXT,
    email_verificado    BOOLEAN DEFAULT FALSE,
    token_recuperacao   TEXT,                        -- token de reset de senha
    token_expira_em     TIMESTAMPTZ,                 -- expiração do token (30 min)
    ultimo_login        TIMESTAMPTZ,
    ativo               BOOLEAN DEFAULT TRUE,
    criado_em           TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email    ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_google   ON usuarios(google_id);

COMMENT ON TABLE  usuarios                IS 'Usuários que acessam o painel — donos das clínicas';
COMMENT ON COLUMN usuarios.senha_hash     IS 'Hash bcrypt da senha. NULL quando autenticado via Google';
COMMENT ON COLUMN usuarios.google_id      IS 'Sub do token Google OAuth';
COMMENT ON COLUMN usuarios.token_recuperacao IS 'Token para reset de senha (expiração: 30 min)';

-- ────────────────────────────────────────────────────────────────
-- TABELA: planos_assinatura
-- Catálogo de planos disponíveis na plataforma
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planos_assinatura (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug             TEXT UNIQUE NOT NULL,           -- basico | profissional | premium
    nome             TEXT NOT NULL,
    preco_mensal     NUMERIC(10,2) NOT NULL,
    dias_trial       INTEGER DEFAULT 14,
    features         JSONB,                          -- lista de funcionalidades
    ativo            BOOLEAN DEFAULT TRUE,
    criado_em        TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO planos_assinatura (slug, nome, preco_mensal, dias_trial, features) VALUES
('basico', 'Básico', 97.00, 14, '{
  "atendimento_24h": true,
  "agendamento_auto": true,
  "lembrete_24h": true,
  "escalada_humano": true,
  "lembrete_2h": false,
  "pos_atendimento": false,
  "relatorio_mensal": false,
  "max_numeros_wpp": 1,
  "pacotes_servicos": false
}'::jsonb),
('profissional', 'Profissional', 197.00, 14, '{
  "atendimento_24h": true,
  "agendamento_auto": true,
  "lembrete_24h": true,
  "escalada_humano": true,
  "lembrete_2h": true,
  "pos_atendimento": true,
  "relatorio_mensal": false,
  "max_numeros_wpp": 1,
  "pacotes_servicos": true
}'::jsonb),
('premium', 'Premium', 347.00, 14, '{
  "atendimento_24h": true,
  "agendamento_auto": true,
  "lembrete_24h": true,
  "escalada_humano": true,
  "lembrete_2h": true,
  "pos_atendimento": true,
  "relatorio_mensal": true,
  "max_numeros_wpp": 2,
  "pacotes_servicos": true,
  "campanhas_reativacao": true,
  "onboarding_assistido": true
}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- TABELA: clinicas
-- Registro central de cada clínica/cliente da plataforma
-- É a tabela-chave do modelo multi-tenant
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinicas (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Vínculo com o usuário dono
    usuario_id          UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Dados cadastrais
    nome                TEXT NOT NULL,
    telefone            TEXT UNIQUE NOT NULL,        -- número WhatsApp principal
    email               TEXT,
    cidade              TEXT,
    responsavel         TEXT,

    -- Plano e cobrança
    plano_id            UUID REFERENCES planos_assinatura(id),
    plano               TEXT NOT NULL DEFAULT 'profissional'
                        CHECK (plano IN ('basico','profissional','premium')),
    status_assinatura   TEXT DEFAULT 'trial'
                        CHECK (status_assinatura IN ('trial','ativo','suspenso','cancelado')),
    trial_inicio        DATE DEFAULT CURRENT_DATE,
    trial_fim           DATE DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    proxima_cobranca    DATE,
    cartao_final        TEXT,                        -- últimos 4 dígitos (tokenizado)
    stripe_customer_id  TEXT,                        -- ID do cliente no Stripe/Pagar.me
    stripe_sub_id       TEXT,                        -- ID da assinatura

    -- Configuração da assistente
    nome_assistente     TEXT DEFAULT 'Luna',
    emoji_assistente    TEXT DEFAULT '💆‍♀️',
    tom_assistente      TEXT DEFAULT 'amigavel'
                        CHECK (tom_assistente IN ('amigavel','profissional','carinhoso','objetivo')),
    prompt_custom       TEXT,                        -- system prompt personalizado
    welcome_msg         TEXT,                        -- mensagem de boas-vindas
    servicos            JSONB,                       -- cardápio [{name, price, duration}]

    -- Configuração WhatsApp
    zapi_instancia      TEXT,
    zapi_token          TEXT,
    zapi_instancia_2    TEXT,                        -- segundo número (plano premium)
    zapi_token_2        TEXT,

    -- Google Calendar
    google_cal_id       TEXT,
    google_refresh_token TEXT,

    -- Período de atendimento
    date_start          DATE,                        -- NULL = imediato
    date_end            DATE,                        -- NULL = sem prazo

    -- Isolamento multi-tenant
    schema_name         TEXT UNIQUE,                 -- ex: clinica_abc123 (prefixo das tabelas)

    -- Controle
    ativo               BOOLEAN DEFAULT TRUE,
    configurado         BOOLEAN DEFAULT FALSE,       -- TRUE após completar o wizard
    criado_em           TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinicas_usuario   ON clinicas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clinicas_telefone  ON clinicas(telefone);
CREATE INDEX IF NOT EXISTS idx_clinicas_plano     ON clinicas(plano);
CREATE INDEX IF NOT EXISTS idx_clinicas_status    ON clinicas(status_assinatura);
CREATE INDEX IF NOT EXISTS idx_clinicas_schema    ON clinicas(schema_name);

COMMENT ON TABLE  clinicas                  IS 'Registro central de cada clínica — chave do multi-tenant';
COMMENT ON COLUMN clinicas.schema_name      IS 'Prefixo usado para isolar tabelas de cada clínica: schema_name + __clientes, __agendamentos etc.';
COMMENT ON COLUMN clinicas.prompt_custom    IS 'System prompt enviado ao Claude para esta clínica';
COMMENT ON COLUMN clinicas.servicos         IS 'JSONB: [{id, name, price, duration, category, preparo}]';
COMMENT ON COLUMN clinicas.cartao_final     IS 'Apenas os 4 últimos dígitos. Dados completos ficam tokenizados no Stripe/Pagar.me';

-- ────────────────────────────────────────────────────────────────
-- TABELA: agenda_horarios
-- Horários de atendimento configurados por dia da semana
-- Permite múltiplos turnos por dia (ex: manhã e tarde)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agenda_horarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    dia_semana      INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),  -- 0=Dom, 6=Sáb
    horario_inicio  TIME NOT NULL,
    horario_fim     TIME NOT NULL,
    ativo           BOOLEAN DEFAULT TRUE,
    criado_em       TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_horario CHECK (horario_fim > horario_inicio)
);

CREATE INDEX IF NOT EXISTS idx_agenda_horarios_clinica ON agenda_horarios(clinica_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agenda_horarios_uniq ON agenda_horarios(clinica_id, dia_semana, horario_inicio);

COMMENT ON TABLE  agenda_horarios           IS 'Turnos de atendimento por dia da semana. Uma clínica pode ter N turnos por dia';
COMMENT ON COLUMN agenda_horarios.dia_semana IS '0=Domingo, 1=Segunda ... 6=Sábado';

-- ────────────────────────────────────────────────────────────────
-- TABELA: agenda_excecoes
-- Datas bloqueadas ou com horário diferente (feriados, férias etc.)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agenda_excecoes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id  UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    data        DATE NOT NULL,
    tipo        TEXT NOT NULL CHECK (tipo IN ('bloqueio','horario_especial')),
    motivo      TEXT,
    inicio      TIME,   -- NULL = dia inteiro bloqueado
    fim         TIME,
    criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_excecoes_clinica ON agenda_excecoes(clinica_id, data);

-- ================================================================
-- BLOCO 2 — DADOS POR CLÍNICA (isolados por schema_name prefix)
-- Cada tabela abaixo é criada com prefixo: schema_name + "__nome"
-- ex: clinica_abc123__clientes, clinica_abc123__agendamentos
--
-- NOTA: As tabelas abaixo são templates. A função
-- criar_schema_clinica() cria uma cópia para cada nova clínica.
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- TABELA TEMPLATE: _tpl_clientes
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _tpl_clientes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id          UUID NOT NULL,               -- FK para clinicas.id
    nome                TEXT,
    telefone            TEXT NOT NULL,
    email               TEXT,
    data_nascimento     DATE,
    observacoes         TEXT,
    historico_resumo    TEXT,                        -- resumo gerado pela IA
    ultimo_agendamento  TIMESTAMPTZ,
    total_agendamentos  INTEGER DEFAULT 0,
    canal_origem        TEXT DEFAULT 'whatsapp',
    ativo               BOOLEAN DEFAULT TRUE,
    criado_em           TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- TABELA TEMPLATE: _tpl_agendamentos
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _tpl_agendamentos (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id              UUID NOT NULL,
    cliente_id              UUID NOT NULL,
    servico                 TEXT NOT NULL,
    data_hora               TIMESTAMPTZ NOT NULL,
    duracao_minutos         INTEGER,
    preco                   NUMERIC(10,2),
    status                  TEXT DEFAULT 'confirmado'
                            CHECK (status IN ('confirmado','cancelado','realizado','no_show','remarcado','pendente')),
    tipo_cobranca           TEXT DEFAULT 'avulso'
                            CHECK (tipo_cobranca IN ('avulso','pacote')),
    cliente_pacote_id       UUID,                    -- preenchido quando tipo_cobranca='pacote'
    google_event_id         TEXT,
    lembrete_24h_enviado    BOOLEAN DEFAULT FALSE,
    lembrete_2h_enviado     BOOLEAN DEFAULT FALSE,
    motivo_cancelamento     TEXT,
    observacoes             TEXT,
    criado_em               TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em           TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- TABELA TEMPLATE: _tpl_conversas
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _tpl_conversas (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id          UUID NOT NULL,
    cliente_id          UUID NOT NULL,
    mensagem_cliente    TEXT NOT NULL,
    resposta_ia         TEXT NOT NULL,
    intent              TEXT,
    servico             TEXT,
    data_desejada       TEXT,
    tipo_cobranca       TEXT,
    cliente_pacote_id   UUID,
    tokens_usados       INTEGER,
    canal               TEXT DEFAULT 'whatsapp',
    criado_em           TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- TABELA TEMPLATE: _tpl_escaladas
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _tpl_escaladas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id      UUID NOT NULL,
    cliente_id      UUID,
    telefone        TEXT NOT NULL,
    motivo          TEXT,
    mensagem        TEXT,
    resolvido       BOOLEAN DEFAULT FALSE,
    resolvido_em    TIMESTAMPTZ,
    atendente       TEXT,
    criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- TABELA TEMPLATE: _tpl_leads
-- Pessoas que entraram em contato mas não agendaram
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _tpl_leads (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id          UUID NOT NULL,
    nome                TEXT,
    telefone            TEXT NOT NULL,
    servico_interesse   TEXT,
    ultima_mensagem     TEXT,
    canal               TEXT DEFAULT 'whatsapp',
    tag                 TEXT DEFAULT 'interessado'
                        CHECK (tag IN ('interessado','sem_resposta','frio','convertido')),
    reativacao_enviada  BOOLEAN DEFAULT FALSE,
    convertido          BOOLEAN DEFAULT FALSE,
    convertido_em       TIMESTAMPTZ,
    criado_em           TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────
-- TABELA TEMPLATE: _tpl_lembretes_log
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS _tpl_lembretes_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id      UUID NOT NULL,
    agendamento_id  UUID NOT NULL,
    cliente_id      UUID NOT NULL,
    tipo            TEXT NOT NULL CHECK (tipo IN ('24h','2h','confirmacao','cancelamento','pos_atendimento','reativacao')),
    mensagem        TEXT NOT NULL,
    status_envio    TEXT DEFAULT 'enviado' CHECK (status_envio IN ('enviado','falhou','pendente')),
    enviado_em      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- BLOCO 3 — PACOTES DE SERVIÇOS (globais, referenciados por clínica)
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- TABELA: pacotes
-- Pacotes criados pela clínica
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacotes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    nome            TEXT NOT NULL,
    preco           NUMERIC(10,2) NOT NULL,
    validity_days   INTEGER NOT NULL DEFAULT 90,
    descricao       TEXT,
    ativo           BOOLEAN DEFAULT TRUE,
    criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacotes_clinica ON pacotes(clinica_id);

-- ────────────────────────────────────────────────────────────────
-- TABELA: pacote_itens
-- Quais serviços e quantas sessões cada pacote inclui
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacote_itens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pacote_id       UUID NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
    service_name    TEXT NOT NULL,
    qty_total       INTEGER NOT NULL CHECK (qty_total > 0),
    criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacote_itens_pacote ON pacote_itens(pacote_id);

-- ────────────────────────────────────────────────────────────────
-- TABELA: cliente_pacotes
-- Pacotes contratados por cada cliente
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cliente_pacotes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    cliente_id      UUID NOT NULL,                  -- ref ao _tpl_clientes da clínica
    pacote_id       UUID NOT NULL REFERENCES pacotes(id),
    data_inicio     DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim        DATE,                           -- calculado automaticamente
    status          TEXT DEFAULT 'ativo'
                    CHECK (status IN ('ativo','expirado','esgotado','cancelado')),
    criado_em       TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cpacotes_cliente  ON cliente_pacotes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cpacotes_clinica  ON cliente_pacotes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_cpacotes_status   ON cliente_pacotes(status);

-- ────────────────────────────────────────────────────────────────
-- TABELA: cliente_pacote_usos
-- Registro de cada sessão consumida de um pacote
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cliente_pacote_usos (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_pacote_id   UUID NOT NULL REFERENCES cliente_pacotes(id) ON DELETE CASCADE,
    pacote_item_id      UUID NOT NULL REFERENCES pacote_itens(id),
    agendamento_id      UUID,
    service_name        TEXT NOT NULL,
    usado_em            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usos_cliente_pacote ON cliente_pacote_usos(cliente_pacote_id);

-- ================================================================
-- BLOCO 4 — TRIGGERS E FUNÇÕES AUTOMÁTICAS
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: set_atualizado_em
-- Atualiza o campo atualizado_em automaticamente
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_atualizado_em ON usuarios;
CREATE TRIGGER trg_usuarios_atualizado_em
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS trg_clinicas_atualizado_em ON clinicas;
CREATE TRIGGER trg_clinicas_atualizado_em
    BEFORE UPDATE ON clinicas
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

DROP TRIGGER IF EXISTS trg_cpacotes_atualizado_em ON cliente_pacotes;
CREATE TRIGGER trg_cpacotes_atualizado_em
    BEFORE UPDATE ON cliente_pacotes
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: set_data_fim_pacote
-- Calcula a data_fim do pacote baseado em validity_days
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_data_fim_pacote()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_fim IS NULL THEN
        NEW.data_fim := NEW.data_inicio + (
            SELECT validity_days FROM pacotes WHERE id = NEW.pacote_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cliente_pacote_data_fim ON cliente_pacotes;
CREATE TRIGGER trg_cliente_pacote_data_fim
    BEFORE INSERT ON cliente_pacotes
    FOR EACH ROW EXECUTE FUNCTION set_data_fim_pacote();

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: gerar_schema_name
-- Gera um schema_name único para a clínica no formato clinica_XXXXX
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION gerar_schema_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.schema_name IS NULL THEN
        NEW.schema_name := 'clinica_' || LOWER(REPLACE(gen_random_uuid()::TEXT, '-', ''))::TEXT;
        NEW.schema_name := LEFT(NEW.schema_name, 24);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clinica_schema_name ON clinicas;
CREATE TRIGGER trg_clinica_schema_name
    BEFORE INSERT ON clinicas
    FOR EACH ROW EXECUTE FUNCTION gerar_schema_name();

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: criar_tabelas_clinica
-- Cria as tabelas isoladas para uma nova clínica
-- Chamada manualmente ou via trigger após INSERT em clinicas
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION criar_tabelas_clinica(p_clinica_id UUID)
RETURNS VOID AS $$
DECLARE
    v_schema TEXT;
BEGIN
    SELECT schema_name INTO v_schema FROM clinicas WHERE id = p_clinica_id;

    -- clientes
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clinica_id          UUID NOT NULL DEFAULT %L,
            nome                TEXT,
            telefone            TEXT NOT NULL,
            email               TEXT,
            data_nascimento     DATE,
            observacoes         TEXT,
            historico_resumo    TEXT,
            ultimo_agendamento  TIMESTAMPTZ,
            total_agendamentos  INTEGER DEFAULT 0,
            canal_origem        TEXT DEFAULT ''whatsapp'',
            ativo               BOOLEAN DEFAULT TRUE,
            criado_em           TIMESTAMPTZ DEFAULT NOW(),
            atualizado_em       TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(clinica_id, telefone)
        )', v_schema || '__clientes', p_clinica_id);

    -- agendamentos
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clinica_id              UUID NOT NULL DEFAULT %L,
            cliente_id              UUID NOT NULL,
            servico                 TEXT NOT NULL,
            data_hora               TIMESTAMPTZ NOT NULL,
            duracao_minutos         INTEGER,
            preco                   NUMERIC(10,2),
            status                  TEXT DEFAULT ''confirmado''
                                    CHECK (status IN (''confirmado'',''cancelado'',''realizado'',''no_show'',''remarcado'',''pendente'')),
            tipo_cobranca           TEXT DEFAULT ''avulso'',
            cliente_pacote_id       UUID,
            google_event_id         TEXT,
            lembrete_24h_enviado    BOOLEAN DEFAULT FALSE,
            lembrete_2h_enviado     BOOLEAN DEFAULT FALSE,
            motivo_cancelamento     TEXT,
            observacoes             TEXT,
            criado_em               TIMESTAMPTZ DEFAULT NOW(),
            atualizado_em           TIMESTAMPTZ DEFAULT NOW()
        )', v_schema || '__agendamentos', p_clinica_id);

    -- conversas
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clinica_id          UUID NOT NULL DEFAULT %L,
            cliente_id          UUID NOT NULL,
            mensagem_cliente    TEXT NOT NULL,
            resposta_ia         TEXT NOT NULL,
            intent              TEXT,
            servico             TEXT,
            data_desejada       TEXT,
            tipo_cobranca       TEXT,
            cliente_pacote_id   UUID,
            tokens_usados       INTEGER,
            canal               TEXT DEFAULT ''whatsapp'',
            criado_em           TIMESTAMPTZ DEFAULT NOW()
        )', v_schema || '__conversas', p_clinica_id);

    -- escaladas
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clinica_id      UUID NOT NULL DEFAULT %L,
            cliente_id      UUID,
            telefone        TEXT NOT NULL,
            motivo          TEXT,
            mensagem        TEXT,
            resolvido       BOOLEAN DEFAULT FALSE,
            resolvido_em    TIMESTAMPTZ,
            atendente       TEXT,
            criado_em       TIMESTAMPTZ DEFAULT NOW()
        )', v_schema || '__escaladas', p_clinica_id);

    -- leads
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clinica_id          UUID NOT NULL DEFAULT %L,
            nome                TEXT,
            telefone            TEXT NOT NULL,
            servico_interesse   TEXT,
            ultima_mensagem     TEXT,
            canal               TEXT DEFAULT ''whatsapp'',
            tag                 TEXT DEFAULT ''interessado'',
            reativacao_enviada  BOOLEAN DEFAULT FALSE,
            convertido          BOOLEAN DEFAULT FALSE,
            convertido_em       TIMESTAMPTZ,
            criado_em           TIMESTAMPTZ DEFAULT NOW(),
            atualizado_em       TIMESTAMPTZ DEFAULT NOW()
        )', v_schema || '__leads', p_clinica_id);

    -- lembretes_log
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            clinica_id      UUID NOT NULL DEFAULT %L,
            agendamento_id  UUID NOT NULL,
            cliente_id      UUID NOT NULL,
            tipo            TEXT NOT NULL,
            mensagem        TEXT NOT NULL,
            status_envio    TEXT DEFAULT ''enviado'',
            enviado_em      TIMESTAMPTZ DEFAULT NOW()
        )', v_schema || '__lembretes_log', p_clinica_id);

    -- Índices nas tabelas criadas
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_tel ON %I(telefone)',
        v_schema, v_schema || '__clientes');
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_data ON %I(data_hora)',
        v_schema, v_schema || '__agendamentos');
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_status ON %I(status)',
        v_schema, v_schema || '__agendamentos');
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_conv ON %I(cliente_id)',
        v_schema, v_schema || '__conversas');
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_leads ON %I(tag)',
        v_schema, v_schema || '__leads');

END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────
-- TRIGGER: auto-criar tabelas ao inserir nova clínica
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_criar_tabelas_clinica_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM criar_tabelas_clinica(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_criar_tabelas ON clinicas;
CREATE TRIGGER trg_auto_criar_tabelas
    AFTER INSERT ON clinicas
    FOR EACH ROW EXECUTE FUNCTION trg_criar_tabelas_clinica_fn();

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: checar_periodo_atendimento
-- Verifica se hoje está dentro do período configurado
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION checar_periodo_atendimento(p_clinica_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_start DATE;
    v_end   DATE;
    v_ativo BOOLEAN;
BEGIN
    SELECT date_start, date_end, ativo INTO v_start, v_end, v_ativo
    FROM clinicas WHERE id = p_clinica_id;

    IF NOT v_ativo THEN RETURN FALSE; END IF;
    IF v_start IS NOT NULL AND CURRENT_DATE < v_start THEN RETURN FALSE; END IF;
    IF v_end   IS NOT NULL AND CURRENT_DATE > v_end   THEN RETURN FALSE; END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: verificar_saldo_pacote
-- Retorna saldo de sessões por serviço de um pacote do cliente
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION verificar_saldo_pacote(p_cliente_pacote_id UUID)
RETURNS TABLE(
    service_name    TEXT,
    qty_total       INTEGER,
    qty_usada       INTEGER,
    qty_restante    INTEGER,
    esgotado        BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pi.service_name,
        pi.qty_total,
        COUNT(pu.id)::INTEGER                           AS qty_usada,
        (pi.qty_total - COUNT(pu.id)::INTEGER)          AS qty_restante,
        (COUNT(pu.id) >= pi.qty_total)                  AS esgotado
    FROM pacote_itens pi
    LEFT JOIN cliente_pacote_usos pu
        ON pu.pacote_item_id = pi.id
       AND pu.cliente_pacote_id = p_cliente_pacote_id
    WHERE pi.pacote_id = (
        SELECT pacote_id FROM cliente_pacotes WHERE id = p_cliente_pacote_id
    )
    GROUP BY pi.id, pi.service_name, pi.qty_total;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: buscar_agendamentos_amanha
-- Usada pelo n8n para disparar lembretes de 24h
-- Retorna agendamentos de TODAS as clínicas ativas
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION buscar_agendamentos_amanha()
RETURNS TABLE(
    agendamento_id    UUID,
    schema_name       TEXT,
    clinica_nome      TEXT,
    clinica_id        UUID,
    zapi_instancia    TEXT,
    zapi_token        TEXT,
    cliente_id        UUID,
    cliente_nome      TEXT,
    cliente_telefone  TEXT,
    servico           TEXT,
    data_hora         TIMESTAMPTZ
) AS $$
DECLARE
    r_clinica RECORD;
    v_sql     TEXT;
BEGIN
    FOR r_clinica IN
        SELECT c.id, c.schema_name, c.nome, c.zapi_instancia, c.zapi_token
        FROM clinicas c
        WHERE c.ativo = TRUE
          AND c.status_assinatura IN ('trial','ativo')
    LOOP
        v_sql := format('
            SELECT
                a.id,
                %L::TEXT,
                %L::TEXT,
                %L::UUID,
                %L::TEXT,
                %L::TEXT,
                a.cliente_id,
                cl.nome,
                cl.telefone,
                a.servico,
                a.data_hora
            FROM %I a
            JOIN %I cl ON cl.id = a.cliente_id
            WHERE a.data_hora::date = (CURRENT_DATE + 1)
              AND a.status = ''confirmado''
              AND a.lembrete_24h_enviado = FALSE',
            r_clinica.schema_name,
            r_clinica.nome,
            r_clinica.id,
            r_clinica.zapi_instancia,
            r_clinica.zapi_token,
            r_clinica.schema_name || '__agendamentos',
            r_clinica.schema_name || '__clientes'
        );
        RETURN QUERY EXECUTE v_sql;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: buscar_agendamentos_2h
-- Lembretes de 2h — apenas planos profissional e premium
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION buscar_agendamentos_2h()
RETURNS TABLE(
    agendamento_id    UUID,
    schema_name       TEXT,
    clinica_nome      TEXT,
    clinica_id        UUID,
    zapi_instancia    TEXT,
    zapi_token        TEXT,
    cliente_id        UUID,
    cliente_nome      TEXT,
    cliente_telefone  TEXT,
    servico           TEXT,
    data_hora         TIMESTAMPTZ
) AS $$
DECLARE
    r_clinica RECORD;
    v_sql     TEXT;
BEGIN
    FOR r_clinica IN
        SELECT c.id, c.schema_name, c.nome, c.zapi_instancia, c.zapi_token
        FROM clinicas c
        WHERE c.ativo = TRUE
          AND c.plano IN ('profissional','premium')
          AND c.status_assinatura IN ('trial','ativo')
    LOOP
        v_sql := format('
            SELECT
                a.id,
                %L::TEXT,
                %L::TEXT,
                %L::UUID,
                %L::TEXT,
                %L::TEXT,
                a.cliente_id,
                cl.nome,
                cl.telefone,
                a.servico,
                a.data_hora
            FROM %I a
            JOIN %I cl ON cl.id = a.cliente_id
            WHERE a.data_hora BETWEEN NOW() AND (NOW() + INTERVAL ''2 hours 10 minutes'')
              AND a.status = ''confirmado''
              AND a.lembrete_2h_enviado = FALSE',
            r_clinica.schema_name,
            r_clinica.nome,
            r_clinica.id,
            r_clinica.zapi_instancia,
            r_clinica.zapi_token,
            r_clinica.schema_name || '__agendamentos',
            r_clinica.schema_name || '__clientes'
        );
        RETURN QUERY EXECUTE v_sql;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────
-- FUNÇÃO: relatorio_mensal_clinica
-- Agrega métricas do mês anterior para o relatório Premium
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION relatorio_mensal_clinica(p_schema TEXT)
RETURNS TABLE(
    total_agendamentos  BIGINT,
    realizados          BIGINT,
    cancelados          BIGINT,
    no_shows            BIGINT,
    faturamento         NUMERIC,
    servico_top         TEXT
) AS $$
DECLARE
    v_sql TEXT;
BEGIN
    v_sql := format('
        SELECT
            COUNT(*)                                                  AS total_agendamentos,
            COUNT(*) FILTER (WHERE status = ''realizado'')            AS realizados,
            COUNT(*) FILTER (WHERE status = ''cancelado'')            AS cancelados,
            COUNT(*) FILTER (WHERE status = ''no_show'')              AS no_shows,
            COALESCE(SUM(preco) FILTER (WHERE status = ''realizado''),0) AS faturamento,
            (SELECT servico FROM %I
             WHERE data_hora >= DATE_TRUNC(''month'', NOW() - INTERVAL ''1 month'')
               AND data_hora < DATE_TRUNC(''month'', NOW())
             GROUP BY servico ORDER BY COUNT(*) DESC LIMIT 1)        AS servico_top
        FROM %I
        WHERE data_hora >= DATE_TRUNC(''month'', NOW() - INTERVAL ''1 month'')
          AND data_hora < DATE_TRUNC(''month'', NOW())',
        p_schema || '__agendamentos',
        p_schema || '__agendamentos'
    );
    RETURN QUERY EXECUTE v_sql;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================================
-- BLOCO 5 — VIEWS
-- =====================================================================================================

-- ────────────────────────────────────────────────────────────────
-- VIEW: resumo_pacotes_cliente
-- Saldo consolidado de cada pacote por cliente
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW resumo_pacotes_cliente AS
SELECT
    cp.id                                                           AS cliente_pacote_id,
    cp.cliente_id,
    cp.clinica_id,
    p.nome                                                          AS pacote_nome,
    cp.data_inicio,
    cp.data_fim,
    cp.status,
    CASE WHEN CURRENT_DATE > cp.data_fim THEN 'expirado'
         ELSE cp.status END                                         AS status_real,
    COUNT(DISTINCT pu.id)                                           AS total_sessoes_usadas,
    SUM(pi.qty_total)                                               AS total_sessoes_contratadas,
    (SUM(pi.qty_total) - COUNT(DISTINCT pu.id))                     AS sessoes_restantes
FROM cliente_pacotes cp
JOIN pacotes      p  ON p.id  = cp.pacote_id
JOIN pacote_itens pi ON pi.pacote_id = p.id
LEFT JOIN cliente_pacote_usos pu ON pu.cliente_pacote_id = cp.id
GROUP BY cp.id, cp.cliente_id, cp.clinica_id, p.nome, cp.data_inicio, cp.data_fim, cp.status;

-- ────────────────────────────────────────────────────────────────
-- VIEW: painel_clinicas
-- Visão administrativa de todas as clínicas e seus status
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW painel_clinicas AS
SELECT
    c.id,
    c.nome,
    c.telefone,
    c.email,
    c.plano,
    c.status_assinatura,
    c.trial_inicio,
    c.trial_fim,
    c.proxima_cobranca,
    c.configurado,
    c.ativo,
    c.schema_name,
    u.nome                                  AS usuario_nome,
    u.email                                 AS usuario_email,
    (CURRENT_DATE - c.trial_inicio)         AS dias_uso,
    (c.trial_fim - CURRENT_DATE)            AS dias_trial_restantes,
    c.criado_em
FROM clinicas c
JOIN usuarios u ON u.id = c.usuario_id
ORDER BY c.criado_em DESC;

-- ────────────────────────────────────────────────────────────────
-- VIEW: horarios_atendimento_clinica
-- Horários completos por clínica com nome do dia
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW horarios_atendimento_clinica AS
SELECT
    ah.id,
    ah.clinica_id,
    c.nome                                      AS clinica_nome,
    ah.dia_semana,
    CASE ah.dia_semana
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
        WHEN 6 THEN 'Sábado'
    END                                         AS dia_nome,
    ah.horario_inicio,
    ah.horario_fim,
    (ah.horario_fim - ah.horario_inicio)        AS duracao_turno,
    ah.ativo
FROM agenda_horarios ah
JOIN clinicas c ON c.id = ah.clinica_id
ORDER BY ah.clinica_id, ah.dia_semana, ah.horario_inicio;

-- =====================================================================================================
-- BLOCO 6 — ROW LEVEL SECURITY (RLS)
-- Ative em produção para garantir que cada usuário veja apenas seus dados
-- =====================================================================================================

ALTER TABLE usuarios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacotes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacote_itens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_pacotes ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário vê apenas seus próprios dados
-- (requer auth.uid() do Supabase Auth — ative quando integrar o Auth)

-- CREATE POLICY "usuario ve proprios dados"
--     ON usuarios FOR ALL
--     USING (id = auth.uid());

-- CREATE POLICY "clinica do usuario"
--     ON clinicas FOR ALL
--     USING (usuario_id = auth.uid());

-- CREATE POLICY "horarios da clinica do usuario"
--     ON agenda_horarios FOR ALL
--     USING (clinica_id IN (SELECT id FROM clinicas WHERE usuario_id = auth.uid()));

-- CREATE POLICY "pacotes da clinica"
--     ON pacotes FOR ALL
--     USING (clinica_id IN (SELECT id FROM clinicas WHERE usuario_id = auth.uid()));

-- =====================================================================================================
-- BLOCO 7 — DADOS DE EXEMPLO PARA DESENVOLVIMENTO
-- Remove este bloco antes de ir para produção
-- =====================================================================================================

-- Usuário de exemplo
INSERT INTO usuarios (id, nome, email, senha_hash, email_verificado) VALUES
('00000000-0000-0000-0000-000000000001',
 'Priscilla Demo',
 'demo@lunaestética.com.br',
 '$2b$12$HASH_EXEMPLO_NAO_FUNCIONAL',  -- substitua por hash bcrypt real
 TRUE)
ON CONFLICT (email) DO NOTHING;

-- Clínica de exemplo (o trigger cria as tabelas automaticamente)
INSERT INTO clinicas (
    id, usuario_id, nome, telefone, email, cidade, responsavel,
    plano, status_assinatura,
    nome_assistente, emoji_assistente, tom_assistente,
    servicos
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Clínica Bella Estética',
    '5511999990000',
    'bella@clinica.com.br',
    'São Paulo, SP',
    'Priscilla Demo',
    'profissional',
    'trial',
    'Luna',
    '💆‍♀️',
    'amigavel',
    '[
        {"id":"1","name":"Limpeza de pele","price":"180","duration":"60","category":"facial"},
        {"id":"2","name":"Design de sobrancelha","price":"80","duration":"30","category":"sobrancelha"},
        {"id":"3","name":"Hidratação facial","price":"150","duration":"45","category":"facial"}
    ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Horários da clínica de exemplo
INSERT INTO agenda_horarios (clinica_id, dia_semana, horario_inicio, horario_fim) VALUES
('00000000-0000-0000-0000-000000000002', 1, '09:00', '12:00'),
('00000000-0000-0000-0000-000000000002', 1, '13:00', '18:00'),
('00000000-0000-0000-0000-000000000002', 2, '09:00', '18:00'),
('00000000-0000-0000-0000-000000000002', 3, '09:00', '18:00'),
('00000000-0000-0000-0000-000000000002', 4, '09:00', '18:00'),
('00000000-0000-0000-0000-000000000002', 5, '09:00', '18:00'),
('00000000-0000-0000-0000-000000000002', 6, '09:00', '13:00')
ON CONFLICT DO NOTHING;

-- =====================================================================================================
-- FIM DO SCRIPT
-- =====================================================================================================

-- Confirmar criação
SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS tamanho
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ================================================================
-- TABELA: evolution_logs
-- Registra reconexões automáticas e alertas de queda
-- ================================================================
CREATE TABLE IF NOT EXISTS evolution_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id  UUID REFERENCES clinicas(id) ON DELETE CASCADE,
    instancia   TEXT NOT NULL,
    tipo        TEXT NOT NULL CHECK (tipo IN ('reconexao_automatica','qr_necessario','queda_detectada','webhook_recebido')),
    status      TEXT,
    detalhes    TEXT,
    criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evolution_logs_clinica   ON evolution_logs(clinica_id);
CREATE INDEX IF NOT EXISTS idx_evolution_logs_tipo      ON evolution_logs(tipo);
CREATE INDEX IF NOT EXISTS idx_evolution_logs_criado_em ON evolution_logs(criado_em DESC);

COMMENT ON TABLE evolution_logs IS 'Log de reconexões automáticas e quedas da Evolution API';
