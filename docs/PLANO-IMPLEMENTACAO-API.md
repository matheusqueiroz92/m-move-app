# Plano de implementação das features da API (TDD)

## Objetivo

Implementar as features da API M. Move em ordem de dependência, seguindo **TDD** (teste antes da implementação), com base na estrutura atual (Prisma, domain, application, interface), nas rotas definidas em `.cursor/rules/backend.mdc` e nos packages compartilhados (types, validators, utils).

---

## Estado atual da API

| Área               | Situação                                                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**         | Schema completo (User, Gym, WorkoutPlan, WorkoutDay, WorkoutExercise, WorkoutSession, PhysicalAssessment, Subscription, AIChat, PTStudentLink, etc.)                                                                                         |
| **App**            | `/health`, `/swagger.json`, `/api/auth/*`, `/api/users`, `/api/workout-plans`, `/api/workout-days`, `/api/sessions`, `/api/assessments`, `/api/gym`, `/api/pt/invites`, `/api/subscriptions` (checkout, portal, status, webhook) registradas |
| **Domain**         | Entidades e interfaces de repositórios existem; vários arquivos vazios ou só esqueleto                                                                                                                                                       |
| **Application**    | GetUserProfileUseCase, CreateWorkoutPlanUseCase, ListWorkoutPlansUseCase, GetWorkoutPlanByIdUseCase, ActivateWorkoutPlanUseCase implementados e testados                                                                                     |
| **Infrastructure** | PrismaUserRepository e PrismaWorkoutPlanRepository implementados; mappers user e workout-plan                                                                                                                                                |
| **Interface HTTP** | Rotas user (GET /me) e workout (GET /, POST /, GET /:id, POST /:id/activate); middlewares authenticate e authorize                                                                                                                           |
| **Packages**       | `packages/types`, `packages/validators`, `packages/utils`, `packages/constants` existem no monorepo                                                                                                                                          |
| **Testes**         | Setup Vitest + Supertest + DB de teste; factories e helpers; exemplo integração (GET /health) e unitário (GetUserProfileUseCase)                                                                                                             |

---

## Princípios do plano

1. **TDD obrigatório**: para cada use case, escrever teste unitário antes da implementação; para cada rota, escrever teste de integração antes do controller; não avançar para a próxima feature sem testes verdes.
2. **TDD (ciclo)**: para cada feature, ordem **teste (Red) → implementação mínima (Green) → refatoração**.
3. **Camadas**: Controller → Use case → Repository; Domain com entidades e erros; sem lógica de negócio em controllers.
4. **Dependências**: implementar em ordem que minimize bloqueios (perfil do usuário antes de planos de treino, etc.).
5. **Packages**: usar `@repo/types`, `@repo/validators` e `@repo/utils` quando existirem; criar schemas/tipos compartilhados conforme necessário.
6. **Auth**: rotas protegidas usam middleware de autenticação (e autorização por role quando aplicável); userId/tenant vêm do token/sessão.

---

## Fase 0: Fundação (registro de rotas e perfil do usuário) ✅

**Objetivo:** Expor uma rota de API protegida e garantir injeção de dependências (repositório → use case → controller).

### Detalhamento TDD – Fase 0

#### Passo 1 – Red: testes de integração (falham)

1. **GET /api/users/me sem autenticação → 401**
   - Arquivo: `get-profile.controller.integration.spec.ts` (ou em `user.routes` integration spec).
   - Given: app pronto, sem cookie nem header de sessão.
   - When: `GET /api/users/me`.
   - Then: `statusCode === 401`.

2. **GET /api/users/me com usuário autenticado → 200 e corpo do perfil**
   - Em ambiente de teste, usar header `X-Test-User-Id` para simular usuário autenticado (evitar assinatura de cookie do Better Auth nos testes).
   - Given: app pronto; usuário criado no banco de teste (via factory/Prisma); request com header `X-Test-User-Id: <id>`.
   - When: `GET /api/users/me`.
   - Then: `statusCode === 200`, body com `id`, `name`, `email`, `role`.

3. **GET /api/users/me com userId inexistente → 404**
   - Given: app pronto; request com `X-Test-User-Id: uuid-inexistente`.
   - When: `GET /api/users/me`.
   - Then: `statusCode === 404`.

#### Passo 2 – Green: implementação mínima

1. **Tipos Fastify**  
   Estender `FastifyRequest` com `userId?: string` (e, se necessário, `session`) para uso no controller. Arquivo: `interface/@types/fastify.d.ts` ou equivalente.

2. **Middleware authenticate**
   - Ler sessão via `auth.api.getSession({ headers })` (usar `fromNodeHeaders` do Better Auth com `request.raw.headers`).
   - Em `NODE_ENV=test`, aceitar header `X-Test-User-Id` e anexar `userId` ao request.
   - Se não houver sessão (e em test não houver header) → responder 401.
   - Caso contrário, anexar `request.userId = session.user.id` (ou do header em test) e seguir.

3. **User mapper**  
   Prisma `User` → DTO `{ id, name, email, role }` (alinhado a `UserRepositoryFindByIdResult`).

4. **PrismaUserRepository**
   - Implementar `findById(userId)` usando Prisma + mapper.
   - Retornar `null` se usuário não existir.

5. **Schema de response (Zod)**  
   `userProfileResponseSchema`: objeto com `id`, `name`, `email`, `role` para documentação e serialização.

6. **GetProfileController**
   - Obter `userId` de `request.userId` (garantido pelo middleware).
   - Instanciar use case com `PrismaUserRepository` (ou receber por injeção).
   - Chamar `GetUserProfileUseCase.execute({ userId })`.
   - Retornar resultado com schema Zod; em caso de `UserNotFoundError` → 404.

7. **Rotas de usuário**
   - Registrar em `user.routes.ts`: `GET /me` (ou `/profile`) com schema de response 200 e 404, middleware `authenticate`, handler do controller.
   - Registrar plugin de user routes em `app.ts` com prefixo `/api/users`.

8. **Error handler**
   - Tratar `UserNotFoundError` no error handler global → resposta 404 com mensagem adequada.

#### Passo 3 – Refactor

- Extrair criação do use case (com repositório) para factory ou injeção explícita se houver duplicação.
- Garantir que DTO/schema do perfil esteja em um único lugar (ex.: `user.schema.ts`).

### 0.1 Registrar rotas no app e middleware de auth

- **Teste:** Teste de integração que chama GET perfil com token inválido → 401; com token válido (ou X-Test-User-Id em test) → 200 e corpo conforme schema (Given/When/Then).
- **Implementação:** Conforme passos 2 acima (middleware, tipos, registro de rotas em app).

### 0.2 GET perfil do usuário autenticado (GET /api/users/me)

- **Teste unitário:** GetUserProfileUseCase já possui testes com repositório mockado.
- **Teste de integração:** Conforme passos 1 acima (401, 200 com perfil, 404 para userId inexistente).
- **Implementação:** Controller, PrismaUserRepository, mapper, schema, rotas e error handler conforme passos 2.

---

## Fase 1: Workout Plans (planos de treino) ✅

Depende de: usuário autenticado (e perfil). Ordem: criar → listar → obter por id → ativar → (opcional) PATCH/DELETE.

### 1.1 Criar plano de treino (POST /api/workout-plans)

- **Testes unitários:** CreateWorkoutPlanUseCase — dado userId e payload (name, description), persistir via repositório e retornar plano criado.
- **Testes de integração:** POST com body válido e auth → 201; sem auth → 401; body inválido → 400.
- **Implementação:** Domain (WorkoutPlan), WorkoutPlanRepository.create, use case, controller, rota com schema Zod. Implementar repositório Prisma.

### 1.2 Listar planos do usuário (GET /api/workout-plans)

- **Testes:** Use case list by userId; integração GET com auth → 200 e array de planos.
- **Implementação:** Repositório findByUserId, use case, controller, rota.

### 1.3 Obter plano por id (GET /api/workout-plans/:id)

- **Testes:** Use case retorna plano quando pertence ao usuário; 404 quando id inexistente ou de outro usuário.
- **Implementação:** Repositório findById + ownership, use case, controller, rota.

### 1.4 Ativar plano (POST /api/workout-plans/:id/activate)

- **Testes:** Regra "apenas um plano ativo por userId" (desativar o atual, ativar o novo); 404 se plano não for do usuário.
- **Implementação:** Use case que orquestra desativar outros + ativar este; repositório update; controller e rota.

### 1.5 (Opcional) PATCH e DELETE plano

- PATCH (name/description) e DELETE (soft delete se aplicável), com verificação de ownership.

---

## Fase 2: Workout Days e Exercises ✅

Depende de: WorkoutPlan existente. Rotas: `/api/workout-plans/:planId/days` e `/api/workout-days/:dayId/exercises`.

### 2.1 CRUD Workout Days

- **Testes:** Use cases create/list/update/delete dias de um plano; integração com planId válido e ownership.
- **Implementação:** Domain WorkoutDay, repositório, use cases, controllers, rotas com schemas Zod.

### 2.2 CRUD Exercises e reorder

- **Testes:** Use cases criar/editar/remover exercícios; reordenar (PATCH reorder).
- **Implementação:** Domain WorkoutExercise, repositório, use cases, controller, rotas GET/POST/PATCH/DELETE e PATCH reorder.

---

## Fase 3: Sessions (sessões de treino) ✅

Rotas: POST /api/sessions/start, PATCH /api/sessions/:id/complete, GET /api/sessions/history, GET /api/sessions/streak.

### 3.1 Iniciar sessão (POST /api/sessions/start) ✅

- **Testes:** Use case "start session" (workoutDayId + userId) cria WorkoutSession com startedAt; integração com auth.
- **Implementação:** PrismaWorkoutSessionRepository, StartWorkoutSessionUseCase, controller, rota; ownership via WorkoutDay → Plan.

### 3.2 Concluir sessão (PATCH /api/sessions/:id/complete) ✅

- **Testes:** Use case define completedAt; não permitir concluir sessão de outro usuário (404).
- **Implementação:** CompleteWorkoutSessionUseCase, controller, rota.

### 3.3 Histórico e streak (GET history e GET streak) ✅

- **Testes:** Use case ou utils de streak (timezone, dias consecutivos); histórico filtrado por userId.
- **Implementação:** GetSessionHistoryUseCase, GetStreakUseCase (usa calculateStreak de @m-move-app/utils); controllers e rotas.

---

## Fase 4: Physical Assessments (avaliações físicas) ✅

CRUD + GET /api/assessments/history/:userId (com autorização: próprio usuário ou PT/owner do aluno).

- **Testes:** Use cases create/read/update/delete e list history; integração com auth e autorização por role.
- **Implementação:** Domain PhysicalAssessment, repositório, use cases, controllers, rotas; middleware de autorização onde necessário.
- **Status:** GET /, POST /, GET /:id, GET /history/:userId implementados; autorização (próprio usuário) em GET :id e GET history/:userId; testes unitários e de integração passando.

---

## Fase 5: Gym (academia) e instrutores ✅

Para perfis OWNER e INSTRUCTOR. Rotas: POST/GET/PATCH /api/gym, POST /api/gym/members, DELETE /api/gym/members/:id.

### 5.1 CRUD Gym (owner)

- **Testes:** Apenas OWNER pode criar/editar academia; use case e integração.
- **Implementação:** Repositório Gym (create, findById, findByOwnerId, update); use cases CreateGym, GetGymById, UpdateGym; controllers; rotas com autorização por role (requireRole OWNER).

### 5.2 Membros e instrutores

- **Testes:** Convidar instrutor (limite maxInstructors); remover instrutor; listar membros.
- **Implementação:** Use cases InviteInstructor, RemoveInstructor, ListGymMembers; repositórios GymInstructor (create, findById, findByGymId, countActiveByGymId, delete); controllers; rotas GET /:id/members, POST /members, DELETE /members/:id.

- **Status:** POST /, GET /:id, PATCH /:id, GET /:id/members, POST /members, DELETE /members/:id implementados; middleware authorize (requireRole) para OWNER; testes unitários e de integração passando.

---

## Fase 6: PT Invites (convites PT → aluno) ✅

Rotas: POST /api/pt/invites, GET /api/pt/invites, DELETE /api/pt/invites/:id, POST /api/pt/invites/accept.

- **Testes:** Use cases enviar convite (token, expiração 7 dias), listar, revogar, aceitar (validar token e expiração).
- **Implementação:** Domain PTStudentLink (repositório, erros PtInviteNotFound, InviteExpired, InviteAlreadyUsed); use cases SendPtInvite, ListPtInvites, RevokePtInvite, AcceptPtInvite; PrismaPtStudentLinkRepository; controllers e rotas com requireRole PERSONAL_TRAINER para enviar/listar/revogar; accept sem role (qualquer usuário autenticado aceita com token).
- **Status:** POST /, GET /, POST /accept, DELETE /:id implementados; token UUID, expiração 7 dias; testes unitários e de integração passando.

---

## Fase 7: Subscriptions (Stripe) ✅

Rotas: POST /api/subscriptions/checkout, POST /api/subscriptions/portal, GET /api/subscriptions/status, POST /api/subscriptions/webhook.

- **Testes:** Unitários com mocks do Stripe; integração (401, 200, 400 para status, checkout, portal, webhook).
- **Implementação:** StripeProvider (checkout, portal, constructWebhookEvent, getSubscriptionDetails); SubscriptionRepository e UserRepository.updateSubscriptionFields/getStripeCustomerId; use cases CreateCheckoutSession, CreatePortalSession, GetSubscriptionStatus, HandleStripeWebhook (checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_failed); controllers e rotas; raw body no webhook (preParsing content-type text/plain); validar assinatura do webhook.
- **Status:** Rotas registradas; env STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET opcionais; testes unitários e de integração passando.

---

## Fase 8: AI (geração de plano, chat, insights) ✅

- **Gerar plano (POST /api/ai/generate-plan):** Testes com mock OpenAI; use case que chama provider e persiste WorkoutPlan, dias e exercícios; OpenAIPlanProviderImpl com GPT-4o e validação Zod do JSON; rotas e integração (401, 400, 503).
- **Chat (POST /api/ai/chat, GET /api/ai/chats):** Repositórios AIChat e AIChatMessage (Prisma); use cases ListUserChats e SendChatMessage (cria chat se chatId null, persiste USER + ASSISTANT); OpenAIChatProvider (chat completions); controllers e rotas; testes unitários e integração (401, 200 lista vazia).
- **Insights (GET /api/ai/insights/:userId):** Use case GetUserInsights; OpenAIInsightsProvider.getInsights (prompt genérico); rota com autorização (apenas próprio userId); testes unitários e integração (401, 403).

Conforme `.cursor/rules/integration-ai.mdc`. Status: Rotas POST /generate-plan, GET /chats, POST /chat, GET /insights/:userId registradas; OPENAI_API_KEY opcional (503 quando não configurado).

---

## Ordem sugerida de execução (resumo)

| Ordem | Fase                     | Entregável principal                                                   |
| ----- | ------------------------ | ---------------------------------------------------------------------- |
| 0     | Fundação                 | Rotas registradas no app; GET perfil (me/profile) funcionando com auth |
| 1     | Workout Plans            | CRUD planos + ativar plano                                             |
| 2     | Workout Days + Exercises | CRUD dias e exercícios + reorder                                       |
| 3     | Sessions                 | Start, complete, history, streak                                       |
| 4     | Assessments              | CRUD avaliações + history por userId                                   |
| 5     | Gym                      | CRUD academia + membros/instrutores                                    |
| 6     | PT Invites               | Enviar, listar, revogar, aceitar convite                               |
| 7     | Subscriptions            | Checkout, portal, status, webhook Stripe                               |
| 8     | AI                       | Generate plan, chat, insights                                          |

---

## Checklist por feature (TDD)

Para cada endpoint/use case:

1. **Red:** Escrever teste unitário do use case (e, se aplicável, teste de integração da rota) que falhe.
2. **Green:** Implementar domain (se necessário), repositório, use case, controller e rota no mínimo para o teste passar.
3. **Refactor:** Extrair DTOs para packages, ajustar nomes, duplicação e tratamento de erros (AppError → 4xx/5xx no error handler).
4. **Documentação:** Garantir que o schema da rota apareça no Swagger (fastify-type-provider-zod).

---

## Observações

- **Packages:** Verificar em cada fase se `@repo/types`, `@repo/validators` e `@repo/utils` exportam o necessário; caso contrário, implementar nesses packages ou temporariamente na API.
- **Migrations:** Novas alterações de modelo exigem `prisma migrate dev` e, para testes, `pnpm db:test:migrate`.
- **Planejamento .docx:** O arquivo `M-MOVE-Planejamento-Atualizado.docx` não foi lido em texto; se houver prioridades ou MVP diferentes, ajuste a ordem das fases conforme o planejamento oficial.
