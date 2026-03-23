# ETM — Ello Task Manager

Sistema interno de gerenciamento de tarefas desenvolvido para uso corporativo. Permite criar, distribuir e acompanhar tarefas entre os setores da empresa com controle de acesso por perfil.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilização | Tailwind CSS + shadcn/ui (Radix UI) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Edge Functions | Deno (Supabase Functions) |
| Estado servidor | TanStack Query v5 |
| Formulários | React Hook Form + Zod |
| Drag & Drop | @dnd-kit/core |
| Roteamento | React Router v7 |
| Ícones | Lucide React |
| Datas | date-fns (pt-BR) |
| Deploy | Vercel |

---

## Funcionalidades

### Kanban Board
- 4 colunas: **A Fazer**, **Em Andamento**, **Aguardando**, **Concluído**
- Drag-and-drop entre colunas com atualização otimista
- Filtros por setor, prioridade e responsável
- Ordenação automática por prioridade (urgente → baixa)
- Colunas com scroll independente

### Tarefas
- Criação com título, descrição, prioridade, setor de origem/destino, prazo e responsável
- Setor de origem pré-preenchido automaticamente com o setor do usuário logado
- "Designar Para" filtrado pelos usuários do setor destino
- Upload de anexos na criação (imagens JPG/PNG/WebP e PDF)
- Edição de tarefas existentes
- Arquivamento soft (campo `arquivado_em`) com restauração
- Exclusão permanente (apenas gestores/admins)

### Workflow de Conclusão
```
Executor → [Solicitar Validação] → status: aguardando
Criador/Gestor → [Validar e Concluir] → status: concluido
```
- Executores (atribuídos ou do setor destino) não podem marcar diretamente como concluído
- Ao solicitar validação: auto-comentário registrado
- Ao validar e concluir: auto-comentário registrado
- Gestores e admins podem concluir diretamente

### Comentários e Anexos
- Comentários com nome do autor e timestamp
- Marcação de "(editado)" em comentários modificados
- Anexo de arquivo junto ao comentário
- Upload de anexos avulsos na página de detalhe
- Download via URL assinada com validade de 5 minutos (Supabase Storage privado)

### Painel Gerencial *(gestor/admin)*
- Total de tarefas ativas
- Contador de tarefas vencidas (em vermelho)
- Contador de tarefas urgentes (em laranja)
- Contador de tarefas cross-setor em aberto (em azul)
- Barra de progresso de conclusão por setor
- Lista de tarefas vencidas com link direto

### Gerenciamento de Usuários *(admin)*
- Criar usuário com email, senha, nome, setor e role
- Alterar setor, role e status ativo/inativo
- Redefinir senha de qualquer usuário
- Excluir usuário com limpeza automática de referências:
  - Arquiva tarefas criadas pelo usuário
  - Remove atribuição de tarefas destinadas a ele
  - Anonimiza audit logs
  - Remove comentários
  - Exclui da autenticação (cascade apaga o profile)

### Tarefas Arquivadas *(gestor/admin)*
- Listagem de todas as tarefas arquivadas
- Botão de restaurar (volta para status "a fazer")
- Botão de excluir permanentemente (com confirmação)

---

## Perfis de Acesso

| Permissão | Colaborador | Gestor | Admin |
|---|:---:|:---:|:---:|
| Ver e criar tarefas | ✓ | ✓ | ✓ |
| Mover tarefas no Kanban | ✓ | ✓ | ✓ |
| Concluir tarefas próprias | ✓ | ✓ | ✓ |
| Concluir tarefas alheias | — | ✓ | ✓ |
| Comentar e anexar arquivos | ✓ | ✓ | ✓ |
| Ver Painel Gerencial | — | ✓ | ✓ |
| Ver Tarefas Arquivadas | — | ✓ | ✓ |
| Gerenciar Usuários | — | — | ✓ |

---

## Setores

`logistica` · `comercial` · `fiscal` · `financeiro` · `ti` · `producao` · `diretoria`

---

## Estrutura do Projeto

```
src/
├── App.tsx                        # Rotas e configuração do QueryClient
├── contexts/
│   └── AuthContext.tsx            # Sessão e perfil do usuário logado
├── router/
│   └── ProtectedRoute.tsx         # Guards de rota por role
├── constants/
│   └── setores.ts                 # Labels, cores e listas dos domínios
├── types/
│   └── database.ts                # Todos os tipos TypeScript do banco
├── lib/
│   ├── supabase.ts                # Cliente Supabase
│   └── utils.ts                   # Utilitário cn() para classes
├── hooks/
│   ├── useTarefas.ts              # CRUD + status + arquivamento de tarefas
│   ├── useComentarios.ts          # Comentários
│   ├── useAnexos.ts               # Upload e signed URLs
│   └── useProfiles.ts             # Perfis + chamadas à Edge Function
├── pages/
│   ├── LoginPage.tsx              # Tela de login (split-screen)
│   ├── KanbanPage.tsx             # Quadro kanban com DnD
│   ├── TarefaDetailPage.tsx       # Detalhe da tarefa
│   ├── TarefaFormPage.tsx         # Criar / editar tarefa
│   ├── PainelPage.tsx             # Dashboard gerencial
│   ├── UsuariosPage.tsx           # Administração de usuários
│   └── ArquivadosPage.tsx         # Tarefas arquivadas
└── components/
    ├── layout/                    # AppLayout, Navbar
    ├── tarefas/                   # TarefaCard, TarefaForm, badges
    └── ui/                        # Componentes shadcn/ui

supabase/
├── migrations/
│   └── 001_trigger_auto_profile.sql   # Trigger auto-cria profile no cadastro
└── functions/
    └── create-user/
        └── index.ts               # Edge Function: criar, redefinir senha, excluir usuário
```

---

## Banco de Dados (Supabase)

### Tabelas principais

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do usuário (nome, setor, role, ativo) — espelho do auth.users |
| `tarefas` | Tarefas com status, prioridade, setores, prazo, criador e responsável |
| `comentarios` | Comentários vinculados a tarefas |
| `anexos` | Metadados de arquivos enviados ao Storage |
| `audit_logs` | Log imutável de ações (user_id pode ser anonimizado) |
| `setores` | Tabela de referência dos setores |

### Trigger
O trigger `on_auth_user_created` cria automaticamente um `profile` ao registrar um novo usuário em `auth.users`, lendo `nome`, `setor` e `role` dos metadados.

### Storage
Bucket `anexos` (privado) com políticas RLS:
- Upload: usuário autenticado
- Download: via signed URL gerada no client (5 min de validade)

---

## Edge Function: `create-user`

Função Deno que executa ações administrativas que requerem a service role key do Supabase, sem expô-la no frontend. Requer que o chamador seja `admin`.

| Action | Descrição |
|---|---|
| `create` | Cria usuário no auth e upsert no profiles |
| `reset-password` | Redefine a senha de um usuário pelo ID |
| `delete-user` | Limpa referências FK e exclui o usuário |

**Deploy:**
```bash
npx supabase functions deploy create-user \
  --project-ref jppuvnhlmrnjupsgzaki \
  --no-verify-jwt
```

---

## Configuração Local

### Pré-requisitos
- Node.js 18+
- Conta no Supabase com o projeto configurado

### Instalação

```bash
git clone https://github.com/Jv1Ttz/Ello-Task-Manager.git
cd Ello-Task-Manager
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

### Iniciar em desenvolvimento

```bash
npm run dev
```

Para acessar pela rede local:

```bash
# vite.config.ts já está configurado com server.host: true
npm run dev
# acesse pelo IP da máquina na porta 5173
```

### Build para produção

```bash
npm run build
```

---

## Primeiro Acesso

1. Crie um usuário pelo painel do Supabase (Auth → Add User)
2. Execute no SQL Editor para promover a admin:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
   ```
3. Faça login com as credenciais criadas
4. Acesse **Usuários** para cadastrar os demais colaboradores

---

## Deploy (Vercel)

O projeto está configurado para deploy automático via Vercel. O arquivo `vercel.json` inclui:
- Rewrite de todas as rotas para `/index.html` (necessário para SPA)
- Headers de segurança (X-Frame-Options, HSTS, CSP, etc.)

Configure as variáveis de ambiente no painel do Vercel com os mesmos valores do `.env.local`.
