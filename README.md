# Sistema de Gerenciamento de Projetos - TCC

# como rodar o projeto:
# na pasta raiz: npm run dev
# na pasta client:npm start (cd client)

Um sistema completo de gerenciamento de projetos desenvolvido em Node.js e React para TCC de Desenvolvimento de Sistemas.

## 🚀 Funcionalidades

### Backend (Node.js + Express)
- ✅ Autenticação JWT
- ✅ CRUD completo de projetos
- ✅ CRUD completo de tarefas
- ✅ Gerenciamento de usuários
- ✅ Sistema de permissões (admin/user)
- ✅ Banco de dados SQLite
- ✅ Validação de dados
- ✅ Middleware de segurança
- ✅ Rate limiting
- ✅ API RESTful completa

### Frontend (React)
- ✅ Interface moderna e responsiva
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de projetos
- ✅ Gerenciamento de tarefas
- ✅ Sistema de autenticação
- ✅ Design system com Tailwind CSS
- ✅ Componentes reutilizáveis
- ✅ Navegação intuitiva

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança
- **cors** - CORS

### Frontend
- **React** - Biblioteca JavaScript
- **React Router** - Roteamento
- **Tailwind CSS** - Framework CSS
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd gerenciamento-de-projetos
```

2. **Instale as dependências do backend**
```bash
npm install
```

3. **Instale as dependências do frontend**
```bash
cd client
npm install
cd ..
```

4. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env na raiz do projeto
cp .env.example .env
```

5. **Inicie o servidor de desenvolvimento**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## 🚀 Como Executar

### Desenvolvimento
```bash
# Backend (porta 5000)
npm run dev

# Frontend (porta 3000)
cd client && npm start
```

### Produção
```bash
# Build do frontend
cd client && npm run build

# Iniciar servidor de produção
npm start
```

## 👤 Credenciais de Teste

O sistema já vem com um usuário administrador criado:

- **Email:** admin@projeto.com
- **Senha:** admin123

## 📚 Estrutura do Projeto

```
gerenciamento-de-projetos/
├── server.js                 # Servidor principal
├── package.json             # Dependências do backend
├── database/
│   └── init.js             # Inicialização do banco
├── middleware/
│   └── auth.js             # Middleware de autenticação
├── routes/
│   ├── auth.js             # Rotas de autenticação
│   ├── projects.js         # Rotas de projetos
│   ├── tasks.js            # Rotas de tarefas
│   └── users.js            # Rotas de usuários
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── contexts/       # Contextos
│   │   ├── services/       # Serviços de API
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Projetos
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects/:id` - Buscar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto
- `GET /api/projects/:id/members` - Listar membros
- `POST /api/projects/:id/members` - Adicionar membro

### Tarefas
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `GET /api/tasks/:id` - Buscar tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Deletar tarefa
- `PATCH /api/tasks/:id/complete` - Marcar como concluída
- `GET /api/tasks/stats/overview` - Estatísticas

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário (admin)
- `GET /api/users/:id/projects` - Projetos do usuário
- `GET /api/users/:id/tasks` - Tarefas do usuário
- `GET /api/users/:id/stats` - Estatísticas do usuário

## 🎨 Funcionalidades do Sistema

### Dashboard
- Visão geral com estatísticas
- Projetos e tarefas recentes
- Ações rápidas

### Gerenciamento de Projetos
- Criar, editar e deletar projetos
- Definir prioridades e status
- Adicionar membros ao projeto
- Visualizar progresso

### Gerenciamento de Tarefas
- Criar, editar e deletar tarefas
- Atribuir tarefas a usuários
- Definir prioridades e prazos
- Marcar como concluída

### Sistema de Usuários
- Registro e login
- Perfis de usuário
- Controle de acesso (admin/user)
- Estatísticas individuais

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com bcrypt
- Validação de dados
- Rate limiting
- Headers de segurança (Helmet)
- CORS configurado

## 📊 Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:

- **users** - Usuários do sistema
- **projects** - Projetos
- **tasks** - Tarefas
- **project_members** - Relacionamento projetos/usuários

## 🎯 Objetivos do TCC

Este projeto demonstra:

1. **Desenvolvimento Full-Stack** - Backend e frontend integrados
2. **Arquitetura RESTful** - API bem estruturada
3. **Segurança** - Autenticação e autorização
4. **UX/UI Moderna** - Interface responsiva e intuitiva
5. **Gerenciamento de Estado** - Context API do React
6. **Validação de Dados** - Formulários seguros
7. **Banco de Dados** - Modelagem e relacionamentos
8. **Deploy** - Pronto para produção

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais como TCC.

## 👨‍💻 Autor

Desenvolvido como Trabalho de Conclusão de Curso em Desenvolvimento de Sistemas.

---

**Sistema de Gerenciamento de Projetos** - Um projeto completo para TCC! 🎓 