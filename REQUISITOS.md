# SendFlow — Checklist de Requisitos

> Arquivo de referência do projeto **SendFlow** (`Projeto-pr-tico-Broadcast`).
> Consulte sempre que precisar verificar se o projeto está em conformidade.

---

## Stack obrigatória

| Tecnologia | Status | Onde |
|---|---|---|
| React + TypeScript | ✅ | `web/` — Vite + React 19 + TS 6 |
| Firebase Auth | ✅ | `web/src/contexts/AuthContext.tsx` |
| Firebase Firestore | ✅ | `web/src/services/` + regras em `firestore.rules` |
| Firebase Functions | ✅ | `functions/src/index.ts` |
| Material UI | ✅ | `@mui/material` v9 — todos os componentes visuais |
| Tailwind CSS | ✅ | `@tailwindcss/vite` — classes utilitárias de layout |
| Vite (não CRA) | ✅ | `web/vite.config.ts` |

---

## Funcionalidades

### Autenticação
- [x] Login com e-mail e senha (Firebase Auth)
- [x] Cadastro de nova conta
- [x] Logout
- [x] Rota privada — redireciona para `/login` se não autenticado (`PrivateRoute.tsx`)

### Conexões
- [x] Listar conexões do usuário autenticado (tempo real)
- [x] Criar nova conexão (apenas nome)
- [x] Editar nome da conexão
- [x] Excluir conexão
- [x] Navegação para contatos/mensagens da conexão

### Contatos
- [x] Listar contatos da conexão (tempo real)
- [x] Criar contato (nome + telefone)
- [x] Editar contato
- [x] Excluir contato

### Mensagens
- [x] Listar mensagens da conexão (tempo real)
- [x] Criar mensagem — seleção de múltiplos contatos, conteúdo e data/hora de disparo
- [x] Editar mensagem (somente se status = `scheduled`)
- [x] Excluir mensagem
- [x] Agendamento — campo `scheduledAt` (timestamp)
- [x] Disparo fake — mensagem não é enviada de fato, apenas muda de status
- [x] Filtrar por: Todas / Enviadas / Agendadas
- [x] **Cloud Function** `dispatchScheduledMessages` — roda a cada 1 minuto e muda `scheduled → sent` automaticamente

---

## Requisitos arquiteturais

| # | Requisito | Status | Evidência |
|---|---|---|---|
| 1 | **SAAS** — cada usuário tem sua área isolada | ✅ | Todos os documentos têm campo `userId`; queries filtram por `userId` |
| 2 | **Isolamento de dados** — cliente não acessa dados de outro | ✅ | `firestore.rules` — função `isOwner()` valida `request.auth.uid == userId` |
| 3 | **Material UI + Tailwind** | ✅ | MUI para componentes, Tailwind para layout e utilitários |
| 4 | **Código limpo** | ✅ | Separação em `pages/`, `components/`, `services/`, `hooks/`, `types/`, `lib/`, `contexts/` |
| 5 | **Paradigma funcional** (sem OO) | ✅ | Nenhuma classe no código frontend ou functions |
| 6 | **Tempo real do Firestore** | ✅ | `onSnapshot` em todos os hooks (`useConnections`, `useContacts`, `useMessages`) |
| 7 | **Vite** | ✅ | `web/vite.config.ts` |
| 8 | **Sem subcoleções** | ✅ | Coleções planas: `connections`, `contacts`, `messages` com campos `userId` / `connectionId` |
| 9 | **Functions separadas do frontend** | ✅ | `functions/` (Node 20) e `web/` (React) são pastas independentes |

---

## Estrutura do projeto

```
Projeto-pr-tico-Broadcast/
├── functions/                  # Cloud Functions (Node 20 + TypeScript)
│   ├── src/
│   │   └── index.ts            # dispatchScheduledMessages (cron a cada 1 min)
│   ├── lib/                    # Compilado pelo tsc
│   ├── package.json
│   └── tsconfig.json
├── web/                        # Frontend (React + Vite + TypeScript)
│   └── src/
│       ├── components/
│       │   └── layout/
│       │       ├── AppShell.tsx        # Layout principal (sidebar + topbar)
│       │       └── PrivateRoute.tsx    # Proteção de rotas
│       ├── contexts/
│       │   └── AuthContext.tsx         # Autenticação Firebase
│       ├── hooks/
│       │   ├── useConnections.ts       # onSnapshot para conexões
│       │   ├── useContacts.ts          # onSnapshot para contatos
│       │   └── useMessages.ts          # onSnapshot para mensagens
│       ├── lib/
│       │   ├── firebase.ts             # Inicialização Firebase
│       │   └── dateUtils.ts            # Formatação de datas
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── ConnectionsPage.tsx
│       │   ├── ContactsPage.tsx
│       │   └── MessagesPage.tsx
│       ├── services/                   # Operações Firestore (CRUD)
│       │   ├── connections.ts
│       │   ├── contacts.ts
│       │   └── messages.ts
│       └── types/
│           └── index.ts                # Connection, Contact, Message, MessageStatus
├── firestore.rules                     # Regras de segurança Firestore
├── firestore.indexes.json
├── firebase.json                       # Hosting → web/dist
├── .firebaserc                         # projeto: projeto-sendflow-broadcast
└── REQUISITOS.md                       # Este arquivo
```

---

## Modelo de dados (Firestore — sem subcoleções)

### `connections/{id}`
```ts
{
  userId: string;       // UID do usuário dono
  name: string;
  createdAt: number;    // timestamp ms
}
```

### `contacts/{id}`
```ts
{
  userId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: number;
}
```

### `messages/{id}`
```ts
{
  userId: string;
  connectionId: string;
  contactIds: string[];
  content: string;
  status: 'scheduled' | 'sent';
  scheduledAt: number;
  sentAt: number | null;
  createdAt: number;
}
```

---

## Regras de segurança Firestore

```
Cada coleção (connections, contacts, messages):
  - read/update/delete: autenticado E dono do documento (resource.data.userId == auth.uid)
  - create: autenticado E userId do novo doc == auth.uid
```

---

## Comandos úteis

```powershell
# Rodar o frontend em desenvolvimento
cd web && npm run dev

# Build do frontend
cd web && npm run build

# Deploy do frontend (Hosting)
firebase deploy --only hosting

# Deploy das regras do Firestore
firebase deploy --only firestore:rules

# Deploy das Cloud Functions (requer plano Blaze)
firebase deploy --only functions

# Deploy completo
firebase deploy
```

---

## Pendências / Próximos passos

- [ ] Deploy das **Cloud Functions** (requer upgrade para plano Blaze no Firebase)
- [ ] Configurar variáveis de ambiente no GitHub Actions (`.env` → secrets do repositório)
- [ ] Deploy do frontend em produção via `firebase deploy --only hosting`
