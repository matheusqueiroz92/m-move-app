# Análise da API antes do desenvolvimento do frontend

Documento gerado para verificar se a API está pronta para consumo pelo frontend e identificar lacunas ou ajustes necessários.

**Última atualização:** após implementação das lacunas críticas GYM (convite, listagem e revogação de alunos).

---

## 1. Resumo executivo

A API está **pronta para o desenvolvimento do frontend**. As lacunas críticas do plano GYM foram implementadas: **POST /api/gym/invites** (enviar convite a aluno), **GET /api/gym/:id/students** (listar alunos) e **DELETE /api/gym/students/:linkId** (revogar acesso de aluno). Auth, workout, sessions, assessments, PT invites, subscriptions, AI e gym (CRUD, instrutores, alunos) estão alinhados com a documentação e com o frontend previsto. Itens **opcionais** (listar planos de um aluno por userId e GET /users/:id para perfil de aluno) permanecem como melhoria futura conforme UX da tela "Perfil do Aluno".

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
- **Gym**: `POST /api/gym/accept-invite`, `POST/GET/PATCH /api/gym`, `GET /api/gym/:id/members` (lista **instrutores**), `POST /api/gym/members` (convite a **instrutor**), `DELETE /api/gym/members/:id` (remover **instrutor**), `POST /api/gym/invites` (convite a **aluno**), `GET /api/gym/:id/students` (lista **alunos**), `DELETE /api/gym/students/:linkId` (revogar **aluno**).
- **PT Invites**: `POST/GET /api/pt/invites`, `DELETE /api/pt/invites/:id`, `POST /api/pt/invites/accept`.
- **Subscriptions**: `POST /api/subscriptions/checkout`, `POST /api/subscriptions/portal`, `GET /api/subscriptions/status`, `POST /api/subscriptions/webhook`.
- **AI**: `POST /api/ai/generate-plan`, `GET /api/ai/chats`, `POST /api/ai/chat`, `GET /api/ai/insights/:userId`.

---

## 3. Lacunas e recomendações

### 3.1 ~~Crítico~~ Implementado: Plano GYM — convite e gestão de alunos (LINKED_STUDENT)

**RN-005:** “Usuário vinculado ao plano GYM (OWNER ou INSTRUCTORS), pode enviar convites para cadastro de LINKED_STUDENTS.”

- **Status:** **Implementado.** **POST /api/gym/invites** — body `{ gymId, inviteEmail, instructorId? }`, apenas OWNER ou INSTRUCTOR do gym. Cria `GymStudentLink` (PENDING), token UUID, validade 7 dias. RN-012 (limite `maxStudents`) aplicado. Resposta 201 com o link criado.

---

### 3.2 ~~Crítico~~ Implementado: Listar alunos da academia (GYM)

**Frontend:** “Meus Alunos” (PT + GYM) — lista e gestão de alunos.

- **Status:** **Implementado.** **GET /api/gym/:id/students** — paginado (limit/offset). RBAC: OWNER vê todos; INSTRUCTOR vê apenas alunos com `instructorId` = seu link. Retorno inclui `items` (com `studentName`, `studentEmail` quando link aceito), `total`, `limit`, `offset`.

---

### 3.3 ~~Crítico~~ Implementado: Revogar acesso de aluno na academia (RN-014)

**RN-014:** “O OWNER pode revogar o acesso de um LINKED_STUDENT, vinculado ao seu plano GYM, a qualquer momento.”

- **Status:** **Implementado.** **DELETE /api/gym/students/:linkId** — apenas OWNER (requireRole). Atualiza `GymStudentLink` para `status: REVOKED` e `revokedAt`. Respostas: 204 sucesso, 403 não-OWNER, 404 link não encontrado.

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
- **README da API:** Descreve rotas (incluindo gym invites, students, revoke), auth, RBAC, testes e CI; alinhado com a implementação atual.

---

## 5. Checklist antes do frontend

| Item                                                            | Status   |
| --------------------------------------------------------------- | -------- |
| Auth (email, OAuth, sessão 30 dias)                             | OK       |
| RBAC e requireActivePlan                                        | OK       |
| CRUD workout plans/days/exercises + reorder                     | OK       |
| Sessions (start, complete, history, streak)                     | OK       |
| Assessments (CRUD + history por userId com RBAC)                | OK       |
| PT invites (send, list, revoke, accept)                         | OK       |
| Subscriptions (checkout, portal, status, webhook)               | OK       |
| AI (generate-plan, chats, chat, insights)                       | OK       |
| Gym: CRUD, accept-invite, instrutores (list/invite/remove)      | OK       |
| Gym: enviar convite a aluno (POST /api/gym/invites)             | OK       |
| Gym: listar alunos (GET /api/gym/:id/students)                  | OK       |
| Gym: revogar acesso de aluno (DELETE /api/gym/students/:linkId) | OK       |
| Listar planos de um aluno (PT/GYM) para “Perfil do Aluno”       | Opcional |
| GET /users/:id para perfil de aluno                             | Opcional |

---

## 6. Conclusão

- A API está **pronta para iniciar o desenvolvimento do frontend**. Todas as lacunas críticas foram preenchidas:
  - **Auth, treinos, sessões, avaliações, convites PT, assinaturas e IA** — já estavam alinhados.
  - **Plano GYM:** implementados `POST /api/gym/invites`, `GET /api/gym/:id/students` e `DELETE /api/gym/students/:linkId`, permitindo fluxo completo de “Meus Alunos” (enviar convite, listar, revogar).
- **Itens opcionais** (listar planos de um aluno por `userId` e `GET /api/users/:id` para perfil de aluno) podem ser implementados depois, conforme a UX da tela “Perfil do Aluno”; a listagem de alunos já retorna `studentName` e `studentEmail` quando o link está aceito, o que pode ser suficiente para listas e cards.
