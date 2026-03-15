# Análise da API antes do desenvolvimento do frontend

Documento gerado para verificar se a API está pronta para consumo pelo frontend e identificar lacunas ou ajustes necessários.

---

## 1. Resumo executivo

A API está **bem estruturada** e cobre a maior parte dos requisitos funcionais e regras de negócio. Há **lacunas importantes** na área de **plano GYM** (convite de alunos, listagem de alunos, revogação) e **um ajuste opcional** para o perfil do aluno (listar planos de um aluno por PT/OWNER/INSTRUCTOR). O restante (auth, workout, sessions, assessments, PT invites, subscriptions, AI) está alinhado com a documentação e com o frontend previsto.

---

## 2. O que está implementado e consistente

### 2.1 Autenticação e autorização (RF-001 a RF-005)

| Requisito                                                     | Status | Observação                                                                                     |
| ------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| RF-001: Login email/senha + OAuth (Google, GitHub)            | OK     | Better Auth em `/api/auth/*`; Google obrigatório, GitHub opcional via env                      |
| RF-002: RBAC (OWNER, INSTRUCTOR, PT, STUDENT, LINKED_STUDENT) | OK     | Middlewares `requireRole`, `requireNotLinkedStudent`, `requireActivePlan`                      |
| RF-003: JWT e refresh com Better Auth                         | OK     | Gerenciado pelo Better Auth                                                                    |
| RF-004: Acesso controlado por plano ativo                     | OK     | `requireActivePlan` nas rotas protegidas; LINKED_STUDENT/INSTRUCTOR sem plano próprio tratados |
| RF-005: Sessão expira em 30 dias                              | OK     | `session.expiresIn: THIRTY_DAYS_SECONDS` em `lib/auth.ts`                                      |

### 2.2 Gestão de treinos (RF-006 a RF-021)

| Requisito                                                                      | Status | Observação                                                 |
| ------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------- |
| RF-006: Plano com pelo menos 1 WorkoutDay                                      | OK     | Validação ao ativar plano e ao deletar dia                 |
| RF-007: WorkoutDay pode ser dia de descanso (isRest)                           | OK     | Schema e repositório                                       |
| RF-008: WorkoutDay com pelo menos 1 Exercise                                   | OK     | Não permite deletar último exercício                       |
| RF-009 / RF-010 / RF-011 / RF-012: Ordem de exercícios                         | OK     | Ordem automática (0 ou last+1), reorder disponível         |
| RF-013: Apenas 1 plano ativo por usuário                                       | OK     | `activateWorkoutPlan` desativa os demais                   |
| RF-014 / RF-015: Sessão só concluída após iniciada e com exercícios concluídos | OK     | Use case de complete session                               |
| RF-016: Streak com timezone do usuário                                         | OK     | Query opcional `timezone`; fallback no perfil do usuário   |
| RF-017: Streak em dias com WorkoutSession concluída                            | OK     | Lógica no use case                                         |
| RF-018: LINKED_STUDENT só vê/executa plano atribuído                           | OK     | `findAssignedPlansByUserIdPaginated` em list workout plans |
| RF-019: LINKED_STUDENT não cria/edita planos                                   | OK     | `requireNotLinkedStudent` nas rotas de criação/edição      |
| RF-020 / RF-021: Acesso até fim do período ao cancelar                         | OK     | Lógica de subscription; webhooks Stripe                    |

### 2.3 Inteligência artificial (RF-021 a RF-026)

| Requisito                                              | Status | Observação                                          |
| ------------------------------------------------------ | ------ | --------------------------------------------------- |
| Geração de planos por IA                               | OK     | `POST /api/ai/generate-plan`                        |
| RF-022: LINKED_STUDENT sem acesso ao chat de IA        | OK     | `requireRole` exclui LINKED_STUDENT nas rotas de AI |
| RF-023: Histórico de conversas por usuário             | OK     | AIChat + AIChatMessage                              |
| RF-024: Insights de progresso                          | OK     | `GET /api/ai/insights/:userId` (próprio userId)     |
| RF-025 / RF-026: Planos editáveis e formato compatível | OK     | CRUD de planos/dias/exercícios; schema Zod          |

### 2.4 Pagamentos (RF-027 a RF-030)

| Requisito                                     | Status | Observação                        |
| --------------------------------------------- | ------ | --------------------------------- |
| RF-027: Stripe                                | OK     | Checkout, portal, webhook         |
| RF-028: Webhooks em tempo real                | OK     | `POST /api/subscriptions/webhook` |
| RF-029: Trial 14 dias                         | OK     | Configurável no Stripe            |
| RF-030: Acesso até fim do período ao cancelar | OK     | Tratamento nos webhooks           |

### 2.5 Rotas documentadas vs implementadas

- **Auth**: `/api/auth/*` (Better Auth) — register, login, logout, me, refresh.
- **Users**: `GET /api/users/me` (perfil do autenticado). Não há `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`; para o frontend atual, `/me` basta para perfil e header.
- **Workout Plans**: `GET/POST /api/workout-plans`, `GET/PATCH/DELETE /api/workout-plans/:id`, `POST /api/workout-plans/:id/activate`, `GET/POST /api/workout-plans/:planId/days`, `PATCH/DELETE /api/workout-plans/:planId/days/:dayId`.
- **Exercises**: `GET/POST /api/workout-days/:dayId/exercises`, `PATCH/DELETE /api/workout-days/:dayId/exercises/:exerciseId`, `PATCH /api/workout-days/:dayId/exercises/reorder`.
- **Sessions**: `POST /api/sessions/start`, `PATCH /api/sessions/:id/complete`, `GET /api/sessions/history`, `GET /api/sessions/streak`.
- **Assessments**: `GET/POST /api/assessments`, `GET /api/assessments/:id`, `GET /api/assessments/history/:userId` (com RBAC: próprio usuário ou aluno vinculado a PT/GYM).
- **Gym**: `POST /api/gym/accept-invite`, `POST/GET/PATCH /api/gym`, `GET /api/gym/:id/members` (lista **instrutores**), `POST /api/gym/members` (convite a **instrutor**), `DELETE /api/gym/members/:id` (remover **instrutor**).
- **PT Invites**: `POST/GET /api/pt/invites`, `DELETE /api/pt/invites/:id`, `POST /api/pt/invites/accept`.
- **Subscriptions**: `POST /api/subscriptions/checkout`, `POST /api/subscriptions/portal`, `GET /api/subscriptions/status`, `POST /api/subscriptions/webhook`.
- **AI**: `POST /api/ai/generate-plan`, `GET /api/ai/chats`, `POST /api/ai/chat`, `GET /api/ai/insights/:userId`.

---

## 3. Lacunas e recomendações

### 3.1 Crítico: Plano GYM — convite e gestão de alunos (LINKED_STUDENT)

**RN-005:** “Usuário vinculado ao plano GYM (OWNER ou INSTRUCTORS), pode enviar convites para cadastro de LINKED_STUDENTS.”

- **Problema:** Não existe endpoint para **enviar convite a aluno** (criar `GymStudentLink` PENDING e enviar email com token). Existe apenas:
  - `POST /api/gym/accept-invite` — aluno aceita com o token.
  - Não há “send gym student invite” (equivalente ao `POST /api/pt/invites` para PT).
- **Impacto:** Frontend “Meus Alunos” / “Convites” para GYM não pode enviar convites; apenas aceitar não basta.
- **Recomendação:** Implementar **POST /api/gym/invites** (ou similar), apenas para OWNER e INSTRUCTOR do gym, com body `{ gymId, inviteEmail, instructorId? }`, criando `GymStudentLink` (PENDING), gerando token e enviando email (validade 7 dias). Respeitar RN-012 (limite de alunos do plano).

---

### 3.2 Crítico: Listar alunos da academia (GYM)

**Frontend:** “Meus Alunos” (PT + GYM) — lista e gestão de alunos.

- **Problema:** `GET /api/gym/:id/members` hoje devolve **instrutores** (GymInstructor), não alunos (GymStudentLink). Não há endpoint para listar alunos da academia.
- **Impacto:** Tela “Meus Alunos” do GYM não tem como listar alunos; só há lista de instrutores.
- **Recomendação:** Criar **GET /api/gym/:id/students** (ou incluir em um único recurso “members” com tipo): listar `GymStudentLink` com status ACTIVE (e eventualmente PENDING), paginado. RBAC:
  - **OWNER:** todos os alunos da academia.
  - **INSTRUCTOR:** apenas alunos com `instructorId` = esse instrutor (RN-006, RF-002f).
  - Retorno deve permitir exibir lista (nome, email, status, data aceite, etc.) e suportar “Perfil do Aluno”.

---

### 3.3 Crítico: Revogar acesso de aluno na academia (RN-014)

**RN-014:** “O OWNER pode revogar o acesso de um LINKED_STUDENT, vinculado ao seu plano GYM, a qualquer momento.”

- **Problema:** Não existe endpoint para revogar vínculo de **aluno** com a academia (marcar `GymStudentLink` como REVOKED). Existe apenas revogação de **convite PT** (`DELETE /api/pt/invites/:id`).
- **Impacto:** OWNER não consegue revogar acesso de um aluno pelo frontend.
- **Recomendação:** Implementar **DELETE /api/gym/students/:linkId** (ou **PATCH /api/gym/students/:linkId** com `status: "REVOKED"`), apenas para OWNER do gym ao qual o link pertence. Atualizar `GymStudentLink` para `status: REVOKED` e `revokedAt`.

---

### 3.4 Opcional: Perfil do aluno — listar planos de um aluno (PT / GYM)

**Frontend:** “Perfil do Aluno” (`/students/:id`) — dados, treinos, avaliações.

- **Situação:**
  - Avaliações: `GET /api/assessments/history/:userId` já permite PT/OWNER/INSTRUCTOR ver histórico do aluno (hasAccess).
  - Planos de treino: hoje `GET /api/workout-plans` retorna apenas os planos do **usuário autenticado**. Não há como PT ou GYM listar os planos de um **aluno** (userId) específico.
- **Impacto:** Na tela “Perfil do Aluno”, “treinos” podem ficar vazios ou só via contorno (ex.: um plano ativo conhecido por outro meio).
- **Recomendação (opcional):** Expor **GET /api/workout-plans?userId=:userId** (ou `GET /api/users/:userId/workout-plans`), com RBAC: apenas se o requester for PT/OWNER/INSTRUCTOR e `userId` for aluno vinculado (PT link ou GymStudentLink ativo). Assim o frontend monta o perfil do aluno com planos + avaliações.

---

### 3.5 Opcional: GET perfil de outro usuário (dados básicos)

- **Situação:** Para “Perfil do Aluno” o frontend pode precisar de nome, email, etc. Hoje só existe `GET /api/users/me`.
- **Recomendação:** Se a listagem de alunos (3.2) já retornar nome, email e id do aluno, pode não ser necessário um `GET /api/users/:id` separado. Caso se queira um endpoint explícito de “perfil público do usuário X” (somente para PT/OWNER/INSTRUCTOR quando X for aluno vinculado), pode-se adicionar **GET /api/users/:id** com essa checagem de vínculo.

---

## 4. Documentação e contratos

- **Swagger/Scalar:** Disponível em `/docs`; schemas e rotas descritos.
- **Packages compartilhados:** `@m-move-app/types` e `@m-move-app/validators` existem e são usados pela API; o frontend pode reutilizar para tipos e validação.
- **README da API:** Descreve rotas, auth, RBAC, testes e CI; está alinhado com o que está implementado. Vale atualizar o README quando forem implementados os endpoints de convite, listagem e revogação de alunos GYM (seções 3.1–3.3).

---

## 5. Checklist antes do frontend

| Item                                                       | Status       |
| ---------------------------------------------------------- | ------------ |
| Auth (email, OAuth, sessão 30 dias)                        | OK           |
| RBAC e requireActivePlan                                   | OK           |
| CRUD workout plans/days/exercises + reorder                | OK           |
| Sessions (start, complete, history, streak)                | OK           |
| Assessments (CRUD + history por userId com RBAC)           | OK           |
| PT invites (send, list, revoke, accept)                    | OK           |
| Subscriptions (checkout, portal, status, webhook)          | OK           |
| AI (generate-plan, chats, chat, insights)                  | OK           |
| Gym: CRUD, accept-invite, instrutores (list/invite/remove) | OK           |
| **Gym: enviar convite a aluno**                            | **Faltando** |
| **Gym: listar alunos (OWNER / INSTRUCTOR)**                | **Faltando** |
| **Gym: revogar acesso de aluno (OWNER)**                   | **Faltando** |
| Listar planos de um aluno (PT/GYM) para “Perfil do Aluno”  | Opcional     |
| GET /users/:id para perfil de aluno                        | Opcional     |

---

## 6. Conclusão

- A API está **pronta para o frontend** nas áreas de auth, treinos, sessões, avaliações, convites PT, assinaturas e IA.
- Para o fluxo completo do **plano GYM** e da tela “Meus Alunos” no frontend, é recomendável implementar **antes** (ou em paralelo ao início do front):
  1. **Enviar convite a aluno (GYM)** — ex.: `POST /api/gym/invites`.
  2. **Listar alunos da academia** — ex.: `GET /api/gym/:id/students` com RBAC OWNER/INSTRUCTOR.
  3. **Revogar acesso de aluno (OWNER)** — ex.: `DELETE /api/gym/students/:linkId` ou PATCH com status REVOKED.

Os itens opcionais (listar planos por userId e GET user por id) podem ser decididos conforme a UX da tela “Perfil do Aluno” e se a listagem de alunos já trouxer dados suficientes.
