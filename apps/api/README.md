# M. Move API (Backend)

Backend da plataforma **M. Move**, construído com **Fastify**, **Prisma** e **PostgreSQL**. Segue Clean Architecture (Hexagonal) com camadas: Domain → Application (use cases) → Infrastructure → Interface HTTP.

## Stack

- **Runtime**: Node.js 24.x
- **Framework**: Fastify 5
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Auth**: Better Auth (Email, Google)
- **Pagamentos**: Stripe (checkout, portal, webhooks)
- **IA**: OpenAI (GPT-4o) — geração de planos, chat, insights
- **Validação**: Zod (body, query, env)
- **Documentação**: Swagger + Scalar
- **Testes**: Vitest, Supertest
- **Segurança**: Helmet (headers), rate-limit (100 req/min global)
- **Performance**: @fastify/compress (gzip/brotli), bodyLimit 1MB

## Estrutura de diretórios

```
apps/api/src/
├── domain/                    # Entidades, erros, interfaces de repositório
│   ├── ai/                    # IA (providers, repositórios AIChat/AIChatMessage)
│   ├── assessment/
│   ├── database/              # TransactionClient
│   ├── gym/                   # gym, gym-instructor, gym-student-link
│   ├── pt-invite/
│   ├── subscription/          # Subscription repository + Stripe provider interface
│   ├── user/
│   └── workout/
├── application/               # Use cases (regras de negócio)
│   ├── ai/                    # generate-plan, chat, list-chats, insights
│   ├── assessment/
│   ├── gym/                   # CRUD gym, invite instructor, accept gym invite
│   ├── pt-invite/
│   ├── subscription/
│   ├── user/
│   └── workout/               # CRUD planos, dias, exercícios, sessões
├── infrastructure/            # Implementações concretas
│   ├── cache/                 # InMemoryUserProfileCache
│   ├── database/prisma/       # Repositories, mappers
│   └── providers/             # Stripe, OpenAI
├── interface/http/            # Camada de entrada HTTP
│   ├── controllers/
│   ├── middlewares/           # authenticate, requireRole, ai-chat-rate-limit
│   ├── plugins/               # api-routes
│   ├── routes/
│   └── error-handler.ts       # Tratamento centralizado (requestId em respostas)
├── lib/                       # db, env, auth
└── test/                      # setup, factories, helpers
```

## Pré-requisitos

- Node.js >= 22 (recomendado 24.x)
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

| Comando                 | Descrição                                                |
| ----------------------- | -------------------------------------------------------- |
| `pnpm dev`              | Sobe a API em modo watch (`tsx watch`)                   |
| `pnpm lint`             | ESLint                                                   |
| `pnpm check-types`      | `tsc --noEmit`                                           |
| `pnpm test`             | Vitest em watch (apenas testes unitários)                |
| `pnpm test:run`         | Vitest uma execução (ideal para CI)                      |
| `pnpm test:unit`        | Apenas testes unitários (exclui `*.integration.spec.ts`) |
| `pnpm test:integration` | Apenas testes de integração (requer `TEST_DATABASE_URL`) |
| `pnpm test:coverage`    | Testes unitários + integração com relatório de cobertura  |
| `pnpm prisma:migrate:dev`   | Cria e aplica migrations em desenvolvimento            |
| `pnpm prisma:migrate:deploy`| Aplica migrations pendentes (produção/CI)              |
| `pnpm db:test:migrate`      | Aplica migrations no banco de teste (usa `.env.test`)  |
| `pnpm db:test:push`         | Sincroniza schema no banco de teste sem migrations     |

## Variáveis de ambiente

Exemplo (ajustar conforme seu ambiente):

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
DATABASE_URL="postgresql://user:password@localhost:5432/mmove"

# Better Auth
BETTER_AUTH_SECRET=
API_BASE_URL=http://localhost:3001
WEB_APP_BASE_URL=http://localhost:3000

# CORS (origens permitidas, separadas por vírgula)
CORS_ORIGIN=http://localhost:3000

# Google (OAuth + Generative AI)
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=
```

- **`LOG_LEVEL`**: `trace` | `debug` | `info` | `warn` | `error` (default: `info`)
- **`TEST_DATABASE_URL`**: obrigatório para testes (`NODE_ENV=test`)
- `OPENAI_API_KEY` e `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` são opcionais: endpoints que dependem delas retornam **503** quando não configuradas

### Banco de testes com Docker

O `docker-compose.yml` sobe um único PostgreSQL com dois bancos (dev e teste). Na **primeira** subida, o script em `docker/postgres/init-test-db.sh` cria o banco `m-move-api-test`.

```bash
cd apps/api
docker compose up -d
```

Se o container já existia **antes** da configuração do banco de teste (ou o volume já estava populado), o script de init não roda de novo. Crie o banco manualmente:

```bash
docker exec -it m-move-api-postgres psql -U postgres -d m-move-api -c 'CREATE DATABASE "m-move-api-test";'
```

Crie o arquivo `.env.test` (não versionado) com a URL do banco de teste. Exemplo usando o Compose padrão:

```env
NODE_ENV=test
TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/m-move-api-test"
```

Antes de rodar os testes de integração, o banco de teste precisa ter o schema (tabelas) criado. Use um dos comandos:

- **`pnpm db:test:push`** — aplica o schema atual no banco de teste sem usar migrations (recomendado quando ainda não há pasta `prisma/migrations` ou para sincronizar rápido).
- **`pnpm db:test:migrate`** — aplica as migrations existentes (use depois de criar migrations com `pnpm prisma migrate dev --name init` no banco de dev).

```bash
cd apps/api
pnpm db:test:push    # ou db:test:migrate se já tiver migrations
pnpm test:integration
```

Os testes de integração de `GET /api/users/me` (200 e 404) dependem das tabelas existirem no banco de teste; o teste de 401 não depende do banco.

## Rotas da API (visão geral)

| Recurso           | Prefixo                           | Descrição                                                                   |
| ----------------- | --------------------------------- | --------------------------------------------------------------------------- |
| **Health**        | `/health`                         | `GET` — health check com checagem de DB (readiness/liveness)                |
| **Auth**          | `/api/auth`                       | `POST /register`, `POST /login`, `POST /logout`, `GET /me`, `POST /refresh` |
| **Users**         | `/api/users`                      | `GET /me` (perfil do usuário autenticado)                                   |
| **Workout Plans** | `/api/workout-plans`              | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, `POST /:id/activate` |
| **Workout Days**  | `/api/workout-plans/:planId/days` | CRUD de dias do plano                                                       |
| **Exercises**     | `/api/workout-days/:dayId/exercises` | CRUD + `PATCH /reorder`                                                  |
| **Sessions**      | `/api/sessions`                   | `POST /start`, `PATCH /:id/complete`, `GET /history`, `GET /streak`         |
| **Assessments**   | `/api/assessments`                | CRUD + `GET /history/:userId` (autorizado: próprio usuário ou PT do aluno)  |
| **Gym**           | `/api/gym`                        | `POST /accept-invite`, CRUD academia (OWNER), `GET /:id/members`, `POST /members`, `DELETE /members/:id` |
| **AI**            | `/api/ai`                         | `POST /generate-plan`, `GET /chats`, `POST /chat`, `GET /insights/:userId`  |
| **PT Invites**    | `/api/pt/invites`                 | `POST /` (enviar), `GET /` (listar), `DELETE /:id` (revogar), `POST /accept` |
| **Subscriptions** | `/api/subscriptions`              | `POST /checkout`, `POST /portal`, `GET /status`, `POST /webhook` (Stripe)   |

### Health check

`GET /health` retorna:
- **200** `{ status: "ok", database: "connected" }` — DB saudável
- **503** `{ status: "unavailable", database: "disconnected", message? }` — DB indisponível

Útil para readiness/liveness em Kubernetes e load balancers.

### Segurança e erros

- **Helmet**: headers de segurança (X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate limit**: 100 requisições/minuto global; rate limit específico para AI Chat por plano
- **Erros**: todas as respostas de erro incluem `requestId` para rastreamento

A documentação detalhada (schemas, exemplos) está em **/docs** (Swagger/Scalar) com a API rodando.

## Banco de dados

- **PostgreSQL** + **Prisma**
- Migrations obrigatórias; não alterar migrations já aplicadas em produção

### Fluxo de migrations (desenvolvimento vs produção)

| Ambiente | Comando | Uso |
|----------|---------|-----|
| **Desenvolvimento** | `pnpm prisma:migrate:dev` | Cria e aplica novas migrations (com nome descritivo: `--name nome_da_mudanca`) |
| **Produção / CI** | `pnpm prisma:migrate:deploy` | Aplica apenas migrations pendentes; não cria novas |
| **Setup rápido** | `pnpm prisma:push` | Sincroniza schema sem migrations (apenas prototipação; evitar em produção) |

**Recomendação para produção:** Usar sempre `prisma:migrate:deploy` no pipeline de deploy (antes de subir a aplicação). Se ainda não houver pasta `prisma/migrations`, crie a primeira migration com `pnpm prisma:migrate:dev --name init` no banco de desenvolvimento e versionar os arquivos gerados.
- Preferir **soft delete** em entidades principais
- Índices em campos usados em `WHERE` com frequência
- Operações múltiplas via `prisma.$transaction`

Entidades principais: `User`, `WorkoutPlan`, `WorkoutDay`, `WorkoutExercise`, `WorkoutSession`, `PhysicalAssessment`, `Gym`, `GymInstructor`, `GymStudentLink`, `Subscription`, `AIChat`, `AIChatMessage`, `PTStudentLink`.

## IA (OpenAI)

- **POST /api/ai/generate-plan** — Gera plano de treino com GPT-4o (objetivo, nível, dias/semana, equipamentos); persiste `WorkoutPlan`, `WorkoutDay` e `WorkoutExercise`. Requer `OPENAI_API_KEY`.
- **GET /api/ai/chats** — Lista conversas do usuário (`AIChat`). **POST /api/ai/chat** — Envia mensagem (cria chat se `chatId` null), persiste em `AIChatMessage` e retorna resposta da IA.
- **GET /api/ai/insights/:userId** — Retorna insights de progresso gerados por IA. Apenas o próprio `userId` (403 para outros).

## Pagamentos (Stripe)

1. Frontend chama `POST /api/subscriptions/checkout` com plano.
2. Backend cria Stripe Checkout Session e retorna URL.
3. Usuário paga no Stripe; Stripe envia webhook para `POST /api/subscriptions/webhook`.
4. Backend atualiza `Subscription`, `User.planType` e `User.subscriptionStatus`.
5. Better Auth usa `planType` para RBAC.

Webhooks tratados: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.trial_will_end`.

## Testes

O projeto segue **TDD** e usa **Vitest** + **Supertest**. O ambiente de testes usa um banco PostgreSQL dedicado (`TEST_DATABASE_URL`).

- **Unitários**: Services, use cases, utils (mock de repositórios e providers). Não usam banco real.
- **Integração**: Controllers + app Fastify + banco de teste. Arquivos `*.integration.spec.ts`; usar `truncateTestDatabase()` em `afterEach` quando o teste gravar dados.
- **Setup**: `src/test/setup.ts` define `NODE_ENV=test` e carrega `.env.test`. Factories em `src/test/factories/`; helpers em `src/test/helpers/db.ts`; mocks de providers em `src/test/mocks/providers.ts`.
- **Boas práticas**: Given/When/Then; não testar ORM diretamente; mockar Stripe/OpenAI em testes unitários; limpar banco após testes de integração que escrevem.

**Comandos:**

```bash
# Testes unitários (não precisa de banco)
pnpm test        # watch
pnpm test:run    # uma execução

# Testes de integração (exige .env.test com TEST_DATABASE_URL e banco migrado)
pnpm db:test:migrate
pnpm test:integration

# Cobertura (unitários + integração)
pnpm test:coverage
```

## Packages compartilhados

- **@m-move-app/types** — `IUser`, `IWorkoutPlan`, DTOs, `PaginatedResponse<T>`, etc.
- **@m-move-app/validators** — schemas Zod (workout, assessment, user, gym, pt-invite, subscription, ai)
- **@m-move-app/utils** — `calculateStreak`, `calculateBMI`, `formatDuration`, `getWeekDayFromDate`

## Regras de desenvolvimento

- Controllers: só recebem request, validam (Zod), chamam service e devolvem response
- Services: concentram lógica de negócio e orquestração
- Repositories: apenas acesso a dados (Prisma)
- Nunca confiar em dados vindos do client; validar com Zod
- Seguir as regras em `.cursor/rules/` (backend, database, payments, tests)

---

Para visão geral do monorepo, veja o [README principal](../../README.md).
