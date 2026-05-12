# SendFlow — Broadcast Message Manager

<p align="center">
  <img src="web/public/logo.png" width="100" alt="SendFlow Logo" />
</p>

<p align="center">
  Plataforma SaaS para gerenciamento de conexões, contatos e agendamento de mensagens em broadcast.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/MUI-6-007FFF?logo=mui" />
</p>

---

## Sobre o projeto

O **SendFlow** permite que usuários autenticados criem **conexões** (canais de broadcast), gerenciem **contatos** por conexão e **agendem mensagens** para envio automático via Firebase Functions.

A arquitetura segue princípios **SaaS multi-tenant**: cada usuário enxerga apenas seus próprios dados, garantidos por Firestore Security Rules.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Material UI v6 |
| Backend | Firebase Functions (Node.js) |
| Banco de dados | Cloud Firestore (tempo real) |
| Autenticação | Firebase Auth (e-mail/senha) |
| Deploy | Firebase Hosting + GitHub Actions |

---

## Funcionalidades

- **Autenticação** — cadastro e login com e-mail e senha
- **Conexões** — crie e gerencie múltiplos canais de broadcast
- **Contatos** — adicione, edite e remova contatos por conexão
- **Mensagens agendadas** — agende disparos com data/hora; datas passadas disparam imediatamente
- **Tempo real** — todas as listas atualizam automaticamente via `onSnapshot` do Firestore
- **Responsivo** — funciona em desktop, tablet e mobile
- **Notificações** — feedback visual (toast) para todas as ações do usuário

---

## Arquitetura

```
Projeto-pr-tico-Broadcast/
├── web/                        # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── layout/         # AppShell, PrivateRoute
│   │   │   └── ui/             # CardSkeleton
│   │   ├── contexts/           # AuthContext, SnackbarContext
│   │   ├── hooks/              # useConnections, useContacts, useMessages
│   │   ├── pages/              # LoginPage, RegisterPage, ConnectionsPage, ...
│   │   ├── services/           # connections.ts, contacts.ts, messages.ts
│   │   ├── types/              # Tipagens TypeScript
│   │   └── lib/                # firebase.ts, dateUtils.ts
│   └── public/                 # Ativos estáticos (logo.png, favicon)
├── functions/                  # Firebase Functions (Node.js)
│   └── src/
│       └── index.ts            # dispatchScheduledMessages (onSchedule)
├── firestore.rules             # Regras de segurança do Firestore
├── firebase.json               # Configuração Firebase
└── REQUISITOS.md               # Checklist dos requisitos do projeto
```

### Modelo de dados (Firestore — coleções planas)

```
connections/{connectionId}
  uid, name, createdAt

contacts/{contactId}
  uid, connectionId, name, phone, createdAt

messages/{messageId}
  uid, connectionId, contactIds[], content,
  scheduledAt, status (scheduled | sent), sentAt
```

> Sem subcoleções — modelo flat para facilitar queries e regras de segurança.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Conta Firebase com projeto criado

### Frontend

```bash
cd web
npm install
cp .env.example .env   # preencha com suas credenciais Firebase
npm run dev            # http://localhost:5173
```

### Variáveis de ambiente (`web/.env`)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Functions (opcional — requer plano Blaze)

```bash
cd functions
npm install
firebase deploy --only functions
```

### Deploy completo

```bash
cd web && npm run build
firebase deploy
```

---

## Segurança

As Firestore Security Rules garantem que cada usuário acesse **apenas seus próprios documentos**:

```js
match /connections/{id} {
  allow read, write: if request.auth.uid == resource.data.uid;
}
```

---

## CI/CD

O repositório conta com GitHub Actions configurados para:

- **Pull Request** → build + deploy em canal de preview do Firebase Hosting
- **Merge na `main`** → deploy automático em produção

---

## Decisões técnicas

| Decisão | Justificativa |
|---|---|
| **Paradigma funcional** | Hooks e funções puras; sem classes ou OOP |
| **Vite** em vez de CRA | Build mais rápido, HMR instantâneo, suporte nativo a ESM |
| **Coleções planas** | Queries mais simples, regras de segurança mais claras |
| **`onSnapshot`** | Atualização em tempo real sem polling |
| **`functions/` separado de `web/`** | Separação de responsabilidades; deploys independentes |
