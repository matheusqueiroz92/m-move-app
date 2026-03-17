# M. Move Web (Frontend)

Frontend da plataforma **M. Move**, construído com **Next.js 16** e **React 19**. Consome a API REST documentada em Swagger/Scalar e oferece experiência completa para alunos, personal trainers e donos de academias.

## Stack

- **React** 19
- **Next.js** 16
- **TypeScript**
- **Tailwind CSS** (configuração via CSS Variables)
- **ShadCN UI**
- **React Hook Form** + **Zod**
- **TanStack Query** (dados remotos)
- **Zustand** (estado global)
- **Axios** (camada HTTP)
- **GSAP** (animações)
- **Lucide React** (ícones)
- **Day.js** (datas)
- **Recharts** (gráficos)
- **clsx** + **tailwind-merge** (classes condicionais)
- **Vitest** + **Testing Library** (testes)

## Estrutura de pastas

```
apps/web/src/
├── app/
│   ├── (auth)/              # Rotas públicas
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Rotas protegidas
│   │   ├── layout.tsx       # Sidebar + header
│   │   ├── page.tsx         # Dashboard overview
│   │   ├── workout-plans/
│   │   ├── sessions/
│   │   ├── progress/
│   │   ├── assessments/
│   │   ├── students/        # PT e GYM
│   │   ├── gym/             # GYM only
│   │   ├── ai-chat/
│   │   └── settings/
│   ├── api/                 # Route handlers Next.js
│   └── components/
│       ├── ui/              # ShadCN + customizados
│       ├── workout/
│       ├── charts/
│       ├── ai-chat/
│       └── layout/          # Sidebar, Header
├── lib/
│   ├── api/                 # Cliente HTTP (Axios)
│   ├── hooks/
│   ├── stores/              # Zustand
│   └── utils/
└── styles/
    └── globals.css          # Tailwind + variáveis
```

## Pré-requisitos

- Node.js >= 22
- API M. Move rodando (para consumo completo)
- Variáveis de ambiente configuradas (URL da API, etc.)

## Instalação e execução

```bash
# Na raiz do monorepo
pnpm install

# Desenvolvimento (a partir da raiz ou de apps/web)
pnpm --filter web dev
# ou dentro de apps/web:
pnpm dev
```

A aplicação sobe em **http://localhost:3000**.

## Variáveis de ambiente

| Variável              | Descrição                                     |
| --------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API (ex: `http://localhost:3001`) |

Em desenvolvimento, o Next faz **rewrite** de `/api/*` para a API; no browser as requisições são same-origin (cookies de auth funcionam).

## Scripts

| Comando              | Descrição                                    |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Next.js em modo desenvolvimento (porta 3000) |
| `pnpm build`         | Build de produção                            |
| `pnpm start`         | Servidor de produção                         |
| `pnpm lint`          | ESLint                                       |
| `pnpm check-types`   | Verificação de tipos (next typegen + tsc)    |
| `pnpm test`          | Vitest (watch)                               |
| `pnpm test:coverage` | Vitest com cobertura                         |

## Design system (cores)

Tokens definidos em CSS Variables (Tailwind / `globals.css`):

| Token                    | Valor     | Uso                   |
| ------------------------ | --------- | --------------------- |
| `--color-primary`        | `#A3E635` | CTAs, links, destaque |
| `--color-primary-dark`   | `#84CC16` | Hover                 |
| `--color-background`     | `#0A0A0B` | Background (dark)     |
| `--color-surface`        | `#141416` | Cards, modais         |
| `--color-border`         | `#27272A` | Bordas                |
| `--color-success`        | `#22C55E` | Streak, conquistas    |
| `--color-warning`        | `#F59E0B` | Alertas               |
| `--color-danger`         | `#EF4444` | Erros, cancelamento   |
| `--color-text-primary`   | `#FAFAFA` | Texto principal       |
| `--color-text-secondary` | `#A1A1AA` | Texto secundário      |

Estilo geral: **dark mode**, **verde neon** como cor de destaque, tipografia clara e layout limpo no estilo SaaS.

## Rotas principais

| Tela             | Rota                    | Planos   | Descrição                            |
| ---------------- | ----------------------- | -------- | ------------------------------------ |
| Landing          | `/`                     | Todos    | Marketing, preços, CTA               |
| Login            | `/login`                | Todos    | Email/senha + OAuth                  |
| Registro         | `/register`             | Todos    | Cadastro + plano                     |
| Dashboard        | `/dashboard`            | Todos    | Streak, próximo treino, métricas     |
| Meus Treinos     | `/workout-plans`        | Todos    | Lista e gestão de planos             |
| Plano de Treino  | `/workout-plans/:id`    | Todos    | Detalhes, dias, exercícios           |
| Executar Treino  | `/sessions/:dayId`      | Todos    | Interface de execução                |
| Progresso        | `/progress`             | Todos    | Gráficos (carga, frequência, streak) |
| Chat IA          | `/ai-chat`              | Todos    | Assistente virtual                   |
| Meus Alunos      | `/students`             | PT + GYM | Gestão de alunos                     |
| Convites         | `/students/invites`     | PT       | Enviar/revogar convites              |
| Aceitar Convite  | `/accept-invite?token=` | Aluno    | Aceitar convite do PT                |
| Perfil do Aluno  | `/students/:id`         | PT + GYM | Dados, treinos, avaliações           |
| Avaliação Física | `/assessments`          | PT + GYM | Registro e histórico                 |
| Gestão Academia  | `/gym`                  | GYM      | Membros, instrutores                 |
| Configurações    | `/settings`             | Todos    | Perfil, plano, pagamento             |
| Pagamento        | `/billing`              | Todos    | Portal Stripe, histórico             |

## Autenticação e autorização

- **JWT** via Better Auth; token em **cookies** seguros
- **Axios**: interceptor com `Authorization` e refresh quando aplicável
- **Guards por role**: `OWNER`, `PERSONAL_TRAINER`, `STUDENT`, `LINKED_STUDENT`
- Rotas protegidas conforme permissões do plano

## Estado e dados

- **Estado global**: Zustand
- **Dados remotos**: TanStack Query (cache, invalidação após mutações)
- **Context**: apenas Auth, Tema, Layout
- **Loading / error / empty**: tratados em todas as telas principais; uso de **Skeleton** onde fizer sentido

## Componentes-chave

- **WorkoutPlanCard** — card de plano com progresso
- **ExerciseList** — lista ordenável (dnd-kit)
- **StreakCalendar** — calendário de frequência
- **ProgressChart** — evolução de carga (Recharts)
- **AssessmentRadar** — radar de medidas
- **AIChatWindow** — interface do chat com IA
- **WorkoutTimer** — timer na execução
- **StudentCard** — card de aluno com status

## Formulários

- **React Hook Form** + **Zod**
- Validações alinhadas ao backend
- Mensagens de erro claras e estados de loading/sucesso

## Animações (GSAP)

- Transições de página e entrada de listas/cards
- Feedback visual em ações
- Uso moderado; utilitário padrão para GSAP quando aplicável

## Testes

- **Vitest** + **Testing Library**
- Foco em: hooks, services, componentes críticos
- **MSW** para mockar API
- Testes por feature; mocks bem definidos
- TDD quando possível

## Boas práticas

- **Clean Code**, **SOLID**, **DRY**, **KISS**
- Componentes pequenos e reutilizáveis; hooks para lógica
- Nenhuma lógica complexa dentro de componentes de UI
- Nenhuma chamada HTTP direta em componentes (usar camada em `lib/api` e TanStack Query)
- Sem estilo inline (exceto animações GSAP)
- Tipagens compartilhadas (`@m-move-app/types`, `validators`)
- Seguir regras em `.cursor/rules/` (frontend, architecture, etc.)

## Documentação da API

A API é documentada em Swagger/Scalar. Use os schemas e contratos da documentação para manter o frontend alinhado (tipos, validações, rotas).

---

Para visão geral do monorepo e da API, veja o [README principal](../../README.md) e o [README da API](../api/README.md).
