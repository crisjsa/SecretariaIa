# Luna. — Secretária Eletrônica de IA para Estética

> Assistente virtual com inteligência artificial que atende clínicas de estética pelo WhatsApp 24h, agenda serviços, envia lembretes e gerencia leads automaticamente.

---

## Visão Geral

O Luna é uma plataforma SaaS multi-tenant que conecta:

- **WhatsApp** (Z-API ou Evolution API) — canal de atendimento
- **Claude API** (Anthropic) — inteligência artificial para processar mensagens
- **n8n** — orquestração dos fluxos de automação
- **Supabase** (PostgreSQL) — banco de dados isolado por clínica
- **Google Calendar** — agendamentos integrados

## Planos

| Plano | Valor | Principais recursos |
|---|---|---|
| Básico | R$ 97/mês | Atendimento 24h, agendamento, lembrete 24h |
| Profissional | R$ 197/mês | + Lembrete 2h, pós-atendimento, pacotes |
| Premium | R$ 347/mês | + Relatório mensal, campanhas, 2 números |

---

## Estrutura do Projeto

```
SecretariaIa/
├── secretaria-estetica/          # Frontend React (Vite)
│   ├── src/
│   │   ├── App.jsx               # Aplicação completa (landing + dashboard)
│   │   └── index.css             # Estilos globais
│   └── package.json
│
├── secretaria_estetica_n8n.json  # Workflow de automação (importar no n8n)
├── evolution_reconexao_n8n.json  # Workflow de monitoramento WhatsApp
├── secretaria_estetica_supabase.sql  # Schema completo do banco de dados
├── .env.example                  # Modelo de variáveis de ambiente
└── README.md
```

---

## Configuração

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais reais. **Nunca commite o `.env`.**

### 2. Banco de dados

1. Crie um projeto no [Supabase](https://supabase.com)
2. Acesse **SQL Editor**
3. Cole o conteúdo de `secretaria_estetica_supabase.sql` e execute

### 3. Automação n8n

1. Acesse seu n8n
2. **Settings → Import Workflow**
3. Importe `secretaria_estetica_n8n.json`
4. Substitua as variáveis com suas credenciais
5. Ative o workflow

### 4. Frontend

```bash
cd secretaria-estetica
npm install
npm run dev        # desenvolvimento
npm run build      # produção → pasta dist/
```

Publique a pasta `dist/` no [Netlify](https://netlify.com/drop).

---

## Arquitetura

```
Cliente (WhatsApp)
       ↓
  Z-API / Evolution API
       ↓
      n8n  ←→  Claude API (Anthropic)
       ↓              ↓
   Supabase    Google Calendar
```

---

## Serviços necessários

| Serviço | Finalidade | Custo |
|---|---|---|
| [Anthropic](https://console.anthropic.com) | API da IA | ~R$ 1-5/mês |
| [Z-API](https://z-api.io) ou Evolution API | WhatsApp | R$ 49/mês ou grátis |
| [n8n](https://n8n.io) ou Railway | Automação | R$ 0-60/mês |
| [Supabase](https://supabase.com) | Banco de dados | R$ 0-140/mês |
| [Google Calendar](https://console.cloud.google.com) | Agendamentos | Grátis |
| [Netlify](https://netlify.com) | Hospedagem site | Grátis |

---

## Documentação

- `Luna_Documentacao_Sistema.docx` — Documentação técnica e operacional completa
- `Luna_Dicionario_Dados.docx` — Dicionário de dados com todas as tabelas e colunas

---

## Stack

- **Frontend:** React + Vite
- **Backend/Automação:** n8n
- **IA:** Claude API (Anthropic) — modelo Haiku 4.5
- **Banco:** PostgreSQL via Supabase
- **WhatsApp:** Z-API ou Evolution API
- **Hospedagem:** Netlify (frontend) + Railway (n8n)

---

## Licença

Projeto privado — todos os direitos reservados.
