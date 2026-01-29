# Assistente Financeiro - Setup & Configuração

## 🚀 Quick Start

### 1. Instalar Dependências
```bash
npm install
```

### 2. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key

# Twilio (WhatsApp Integration - Opcional)
TWILIO_ACCOUNT_SID=seu_twilio_account_sid
TWILIO_AUTH_TOKEN=seu_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+5511999999999

# OpenAI (AI Features - Opcional)
OPENAI_API_KEY=sua_openai_api_key
```

### 3. Rodar Servidor Dev
```bash
npm run dev
```

Acesse `http://localhost:3000`

### 4. Build para Produção
```bash
npm run build
npm start
```

---

## 📋 Funcionalidades

### ✅ Web (Implementado)
- **Transações**: Adicionar, editar, excluir receitas e despesas
- **Contas**: Gerenciar contas a pagar/receber com suporte a recorrência
- **Lembretes**: Criar, editar, marcar como concluído
- **Metas Financeiras**: Adicionar, editar, acompanhar progresso
- **Dashboard**: Resumo financeiro com gráficos
- **Relatórios**: Análise de despesas e receitas

### 🚀 WhatsApp Bot (Conectado ao Twilio)
- Receber mensagens via WhatsApp
- Transcrever áudios (Whisper API)
- Extrair dados financeiros (GPT-4)
- Responder inteligentemente
- Salvar transações automaticamente

### 🎨 Design
- Interface premium com paleta: Preto, Dourado, Grafite
- Responsivo (desktop, tablet, mobile)
- Dark mode por padrão
- Componentes shadcn/ui

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Obrigatórias
```sql
-- Usuários
CREATE TABLE users (...)

-- Transações
CREATE TABLE transactions (...)

-- Contas a Pagar/Receber
CREATE TABLE accounts_payable (...)
CREATE TABLE accounts_receivable (...)

-- Lembretes
CREATE TABLE reminders (...)

-- Metas Financeiras
CREATE TABLE financial_goals (...)

-- Categorias
CREATE TABLE categories (...)
```

Execute as migrações:
```bash
node apply-migration.js
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Dashboard
│   ├── transactions/       # Gerenciar transações
│   ├── bills/              # Contas a pagar/receber
│   ├── reminders/          # Lembretes
│   ├── goals/              # Metas financeiras
│   ├── reports/            # Relatórios
│   └── api/
│       └── whatsapp/webhook/   # Webhook Twilio
├── components/
│   ├── Dashboard.tsx       # Componente Dashboard
│   ├── Navigation.tsx      # Navegação
│   └── ui/                 # Componentes shadcn
├── lib/
│   ├── supabase.ts        # Cliente Supabase
│   └── utils.ts           # Utilitários
└── hooks/
    └── use-toast.ts       # Toast notifications
```

---

## 🔐 Segurança

- **Row-Level Security (RLS)**: Habilitado no Supabase
- **Autenticação**: Supabase Auth (JWT)
- **Variáveis Secretas**: Nunca commit `.env.local`

---

## 🐛 Troubleshooting

### Erro: "Supabase não está configurado"
Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão no `.env.local`

### Erro: "Twilio não está configurado"
Twilio é opcional. Se não usar WhatsApp, deixe as vars vazias.

### Erro de compilação TypeScript
```bash
npm run build
```

### Limpar cache Next.js
```bash
rm -rf .next
npm run dev
```

---

## 📞 Contato & Suporte

Para dúvidas, abra uma issue no repositório.

---

## 📄 Licença

MIT License - Veja LICENSE.md
