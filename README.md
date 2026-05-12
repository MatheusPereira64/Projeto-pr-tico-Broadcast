# Broadcast - Projeto Prático

Sistema SaaS de disparo de mensagens em broadcast. Cada cliente possui sua área isolada com conexões, contatos e mensagens.

## Estrutura do Projeto

```
Projeto-SendFlow-Broadcast/
├── web/              # Frontend React + TypeScript + Vite
├── functions/        # Firebase Cloud Functions (TypeScript)
├── firestore.rules   # Regras de segurança do Firestore
├── firestore.indexes.json
├── firebase.json
└── .firebaserc
```

## Tecnologias

- **Frontend:** React 19, TypeScript, Vite, Material UI v9, Tailwind CSS v4
- **Backend:** Firebase Auth, Firestore (tempo real), Cloud Functions
- **Paradigma:** Funcional (sem orientação a objeto)

## Estrutura do Firestore

Sem subcoleções — todas as coleções ficam na raiz:

| Coleção       | Campos principais                                                      |
|---------------|------------------------------------------------------------------------|
| `connections` | `id`, `userId`, `name`, `createdAt`                                   |
| `contacts`    | `id`, `userId`, `connectionId`, `name`, `phone`, `createdAt`          |
| `messages`    | `id`, `userId`, `connectionId`, `contactIds[]`, `content`, `status`, `scheduledAt`, `sentAt`, `createdAt` |

## Como executar

### 1. Configurar o Firebase

Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e ative:
- Authentication (Email/Password)
- Firestore Database
- Cloud Functions (plano Blaze)

### 2. Configurar variáveis de ambiente

```bash
cp web/.env.example web/.env
# Preencha com as credenciais do seu projeto Firebase
```

### 3. Inicializar o Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use --add  # Selecione seu projeto
```

### 4. Rodar o frontend

```bash
cd web
npm install
npm run dev
```

### 5. Deploy das Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 6. Deploy das regras e índices do Firestore

```bash
firebase deploy --only firestore
```

### 7. Deploy completo (hosting + functions + firestore)

```bash
cd web && npm run build
firebase deploy
```

## Funcionalidades

- **Login / Cadastro** com Firebase Auth
- **Conexões:** CRUD de conexões (cada cliente tem as suas)
- **Contatos:** CRUD de contatos vinculados a uma conexão (nome + telefone)
- **Mensagens:**
  - Criação com seleção de múltiplos contatos
  - Agendamento de disparo por data/hora
  - Filtro por status: Todas / Enviadas / Agendadas
  - CRUD completo
  - **Cloud Function** executa a cada minuto e muda mensagens agendadas para `sent` quando o horário chega

## Segurança

As Firestore Security Rules garantem isolamento total entre clientes:
- Cada documento tem o campo `userId` do proprietário
- Leitura e escrita só são permitidas para o usuário autenticado dono do documento
