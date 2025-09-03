# Gerenciamento de Projetos

Sistema completo para gerenciamento de projetos, tarefas e usuários, com autenticação, backend em Node.js e frontend em React.

## Sumário

- Visão Geral
- Tecnologias Utilizadas
- Estrutura de Pastas
- Instalação
- Como Usar
- Funcionalidades
- Autores

## Visão Geral

Este projeto permite o cadastro e gerenciamento de projetos, tarefas e usuários, com autenticação JWT, interface moderna e integração entre backend e frontend.

## Tecnologias Utilizadas

- **Backend:** Node.js, Express
- **Frontend:** React, Tailwind CSS
- **Banco de Dados:** (definido em `backend/database/init.js`)
- **Outros:** PostCSS

## Estrutura de Pastas

```
dados de login.txt         # Dados de exemplo para login
backend/                   # Backend Node.js
  install.bat/.sh          # Scripts de instalação
  server.js                # Servidor principal
  database/                # Inicialização do banco
  middleware/              # Middlewares (ex: autenticação)
  routes/                  # Rotas da API (auth, projetos, tarefas, usuários)
client/                    # Frontend React
  public/                  # Arquivos públicos
  src/                     # Código fonte React
    components/            # Componentes reutilizáveis
    contexts/              # Contextos globais (ex: Auth)
    pages/                 # Páginas principais
    services/              # Serviços de API
```

## Instalação

### Backend

```bash
cd backend
# Windows:
./install.bat
# Linux/Mac:
./install.sh
```

### Frontend

```bash
cd client
npm install
```

## Como Usar

### Iniciar Backend

```bash
cd backend
node server.js
```

### Iniciar Frontend

```bash
cd client
npm start
```

Acesse o frontend em `http://localhost:3000`.

## Funcionalidades

### Backend

- Autenticação JWT
- Rotas protegidas
- CRUD de projetos, tarefas e usuários
- Middleware de autenticação
- Inicialização do banco de dados

### Frontend

- Login e registro de usuários
- Dashboard com visão geral
- Cadastro e edição de projetos e tarefas
- Visualização de detalhes de projetos
- Gerenciamento de usuários
- Interface responsiva com Tailwind CSS

## Autores

- JonathanMDS75
- Colaboradores: Luiz Nazario

---

> Para dúvidas ou sugestões, abra uma issue ou entre em contato.


