# M. Move API (Backend)

Backend da plataforma **M. Move**, construído com **Fastify**, **Prisma** e **PostgreSQL**. Segue Clean Architecture com camadas: Controllers → Services → Repositories → Domain.

## Stack

- **Runtime**: Node.js
- **Framework**: Fastify
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
| `pnpm db:test:migrate`  | Aplica migrations no banco de teste (usa `.env.test`)    |
| `pnpm db:test:push`     | Sincroniza schema no banco de teste sem migrations       |

## Variáveis de ambiente

Exemplo (ajustar conforme seu ambiente):

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/mmove"

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3001

# Google
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_STUDENT=
STRIPE_PRICE_ID_PERSONAL=
STRIPE_PRICE_ID_GYM=

# OpenAI
OPENAI_API_KEY=
```

Para **testes**, é obrigatório um PostgreSQL dedicado e a variável `TEST_DATABASE_URL`.

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
| **Auth**          | `/api/auth`                       | `POST /register`, `POST /login`, `POST /logout`, `GET /me`, `POST /refresh` |
| **Users**         | `/api/users`                      | `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`                            |
| **Workout Plans** | `/api/workout-plans`              | CRUD + `POST /:id/activate`                                                 |
| **Workout Days**  | `/api/workout-plans/:id/days`     | CRUD de dias do plano                                                       |
| **Exercises**     | `/api/workout-days/:id/exercises` | CRUD + `PATCH /reorder`                                                     |
| **Sessions**      | `/api/sessions`                   | `POST /start`, `PATCH /:id/complete`, `GET /history`, `GET /streak`         |
| **Assessments**   | `/api/assessments`                | CRUD + `GET /history/:userId`                                               |
| **Gym**           | `/api/gym`                        | CRUD academia + `POST /members`, `DELETE /members/:id`                      |
| **AI**            | `/api/ai`                         | `POST /chat`, `GET /chats`, `POST /generate-plan`, `GET /insights/:userId`  |
| **PT Invites**    | `/api/pt/invites`                 | `POST /` (enviar), `GET /` (listar), `DELETE /:id`, `POST /accept`          |
| **Subscriptions** | `/api/subscriptions`              | `POST /checkout`, `POST /portal`, `GET /status`, `POST /webhook`            |

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
