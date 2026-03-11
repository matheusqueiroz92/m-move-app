# M. Move API (Backend)

Backend da plataforma **M. Move**, construído com **Fastify**, **Prisma** e **PostgreSQL**. Segue Clean Architecture com camadas: Controllers → Services → Repositories → Domain.

## Stack

- **Runtime**: Node.js 24.x
- **Framework**: Fastify 5
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Auth**: Better Auth (Email, Google, GitHub)
- **Pagamentos**: Stripe (checkout, portal, webhooks)
- **IA**: OpenAI (GPT-4o) — geração de planos, chat, insights
- **Validação**: Zod (body, query, env)
- **Documentação**: Swagger + Scalar
- **Testes**: Vitest, Supertest

## Estrutura de diretórios

```
apps/api/src/
├── domain/
│   ├── entities/       # Entidades de domínio
│   ├── repositories/   # Interfaces de repositórios
│   └── use-cases/      # Services / casos de uso
├── infrastructure/
│   ├── database/       # Prisma client
│   ├── repositories/   # Implementações Prisma
│   ├── http/
│   │   ├── controllers/  # Handlers Fastify
│   │   ├── middlewares/   # Auth, RBAC, rate-limit
│   │   └── routes/       # Registro de rotas
│   └── providers/      # Stripe, OpenAI, Email
├── shared/
│   ├── errors/         # AppError, HttpException
│   └── decorators/
├── server.ts
├── app.ts
└── index.ts
```

## Pré-requisitos

- Node.js >= 18 (recomendado 24.x)
- PostgreSQL em execução
- Variáveis de ambiente configuradas (ver seção **Ambiente**)

## Instalação e execução

```bash
# Na raiz do monorepo
pnpm install

# Entrar no app api
cd apps/api

# Variáveis de ambiente
cp .env.example .env   # se existir; editar .env com seus valores

# Gerar cliente Prisma (após configurar DATABASE_URL)
pnpm prisma generate

# Migrations (criar/atualizar banco)
pnpm prisma migrate dev --name <nome_da_migracao>

# Desenvolvimento
pnpm dev
```

A API sobe por padrão em **http://localhost:3001**. A documentação Swagger/Scalar fica em **http://localhost:3001/docs**.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Sobe a API em modo watch (`tsx watch`) |
| `pnpm lint` | ESLint |
| `pnpm check-types` | `tsc --noEmit` |
| `pnpm test` | Testes (Vitest) |

## Variáveis de ambiente

Exemplo (ajustar conforme seu ambiente):

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/mmove"

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3001

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_STUDENT=
STRIPE_PRICE_ID_PERSONAL=
STRIPE_PRICE_ID_GYM=

# OpenAI
OPENAI_API_KEY=
```

Para testes, usar `TEST_DATABASE_URL` em um banco dedicado.

## Rotas da API (visão geral)

| Recurso | Prefixo | Descrição |
|---------|---------|-----------|
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `POST /logout`, `GET /me`, `POST /refresh` |
| **Users** | `/api/users` | `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` |
| **Workout Plans** | `/api/workout-plans` | CRUD + `POST /:id/activate` |
| **Workout Days** | `/api/workout-plans/:id/days` | CRUD de dias do plano |
| **Exercises** | `/api/workout-days/:id/exercises` | CRUD + `PATCH /reorder` |
| **Sessions** | `/api/sessions` | `POST /start`, `PATCH /:id/complete`, `GET /history`, `GET /streak` |
| **Assessments** | `/api/assessments` | CRUD + `GET /history/:userId` |
| **Gym** | `/api/gym` | CRUD academia + `POST /members`, `DELETE /members/:id` |
| **AI** | `/api/ai` | `POST /chat`, `GET /chats`, `POST /generate-plan`, `GET /insights/:userId` |
| **PT Invites** | `/api/pt/invites` | `POST /` (enviar), `GET /` (listar), `DELETE /:id`, `POST /accept` |
| **Subscriptions** | `/api/subscriptions` | `POST /checkout`, `POST /portal`, `GET /status`, `POST /webhook` |

A documentação detalhada (schemas, exemplos) está em **/docs** (Swagger/Scalar) com a API rodando.

## Banco de dados

- **PostgreSQL** + **Prisma**
- Migrations obrigatórias; não alterar migrations já aplicadas em produção
- Preferir **soft delete** em entidades principais
- Índices em campos usados em `WHERE` com frequência
- Operações múltiplas via `prisma.$transaction`

Entidades principais: `User`, `WorkoutPlan`, `WorkoutDay`, `WorkoutExercise`, `WorkoutSession`, `PhysicalAssessment`, `Gym`, `Subscription`, `AIChat`, `AIChatMessage`, `PTStudentLink`.

## Pagamentos (Stripe)

1. Frontend chama `POST /api/subscriptions/checkout` com plano.
2. Backend cria Stripe Checkout Session e retorna URL.
3. Usuário paga no Stripe; Stripe envia webhook para `POST /api/subscriptions/webhook`.
4. Backend atualiza `Subscription`, `User.planType` e `User.subscriptionStatus`.
5. Better Auth usa `planType` para RBAC.

Webhooks tratados: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.trial_will_end`.

## Testes

- **TDD**: escrever teste → falhar → implementar mínimo → passar → refatorar
- **Unitários**: Services, utils, validators (Vitest)
- **Integração**: endpoints + banco (Vitest + Supertest, `TEST_DATABASE_URL`)
- **Boas práticas**: Given/When/Then; não testar ORM diretamente; mockar Stripe/OpenAI; limpar dados entre testes

```bash
pnpm test
```

## Packages compartilhados

- **@m-move-app/types** — `IUser`, `IWorkoutPlan`, DTOs, `PaginatedResponse<T>`, etc.
- **@m-move-app/validators** — schemas Zod (workout, assessment, auth, AI)
- **@m-move-app/utils** — `calculateStreak`, `calculateBMI`, `formatDuration`, `getWeekDayFromDate`

## Regras de desenvolvimento

- Controllers: só recebem request, validam (Zod), chamam service e devolvem response
- Services: concentram lógica de negócio e orquestração
- Repositories: apenas acesso a dados (Prisma)
- Nunca confiar em dados vindos do client; validar com Zod
- Seguir as regras em `.cursor/rules/` (backend, database, payments, tests)

---

Para visão geral do monorepo, veja o [README principal](../../README.md).
