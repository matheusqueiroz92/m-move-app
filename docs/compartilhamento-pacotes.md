# Uso dos pacotes compartilhados no monorepo

**Estado:** Implementado apenas no **backend (API)**. O frontend será desenvolvido do zero depois e passará a consumir os mesmos pacotes.

## Problema identificado

O projeto é um **monorepo** (Turborepo) com a pasta `packages/` destinada a código compartilhado entre **api**, **web** e **mobile** (futuro). Hoje há inconsistência:

| Aspecto                 | Situação atual                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **packages/types**      | `export {}` — vazio; tipos definidos só na API (domain, schemas)                                                                  |
| **packages/validators** | `export {}` — vazio; schemas Zod duplicados na API (`workout.schema.ts`, `user.schema.ts`)                                        |
| **packages/utils**      | `export {}` — vazio; regras citam `calculateStreak`, `formatDuration`, etc.                                                       |
| **packages/constants**  | `export {}` — vazio; enums (UserRole, WeekDay, etc.) só na API/Prisma                                                             |
| **apps/api**            | Não declara `@m-move-app/types`, `validators`, `utils`, `constants`; usa apenas `@repo/eslint-config` e `@repo/typescript-config` |
| **apps/web**            | Usa apenas `@m-move-app/ui`; não usa types, validators, utils, constants                                                          |

Consequências:

- Duplicação de tipos e schemas quando o frontend consumir a API.
- Risco de divergência (ex.: campo novo na API e esquecido no frontend).
- Regras do backend (`.cursor/rules/backend.mdc`) exigem uso de `@m-move-app/types`, `validators` e `utils`, mas eles não estão implementados nem referenciados.

---

## Solução proposta

### 1. Escopo dos pacotes

Manter:

- **@repo/eslint-config** e **@repo/typescript-config** → ferramentas de build/lint (escopo `@repo`).
- **@m-move-app/types**, **validators**, **utils**, **constants**, **ui** → domínio da aplicação (escopo `@m-move-app-app`).

### 2. Conteúdo de cada pacote

#### **@m-move-app/types**

- Interfaces de domínio/API compartilhadas (não acopladas ao Prisma):
  - `User`, `WorkoutPlan`, `WorkoutDay`, `WorkoutExercise`, `WorkoutSession`
  - `PhysicalAssessment`, `Gym`, `Subscription`, etc.
- DTOs de request/response (ex.: `CreateWorkoutPlanBody`, `WorkoutPlanResponse`).
- Tipos auxiliares: `PaginatedResponse<T>`, enums re-exportados de `@m-move-app/constants` quando fizer sentido.

Uso: **api** e **web** importam tipos para contratos da API e tipagem de estado.

#### **@m-move-app/constants**

- Enums e constantes de domínio:
  - `UserRole`, `PlanType`, `SubscriptionStatus`, `WeekDay`
  - Constantes de negócio (limites, defaults).

Uso: **api**, **web** e **validators** (Zod pode usar enums).

#### **@m-move-app/validators**

- Schemas Zod **compartilhados**:
  - Workout: `createWorkoutPlanSchema`, `createWorkoutDaySchema`, `createWorkoutExerciseSchema`, etc.
  - Auth: `loginSchema`, `registerSchema`
  - Outros: `createPhysicalAssessmentSchema`, etc.
- A API pode **estender** ou **re-exportar** esses schemas para adicionar campos específicos (ex.: response) ou validações extras.

Uso: **api** (validação de body/params) e **web** (formulários e validação no cliente).

#### **@m-move-app/utils**

- Funções puras e helpers:
  - `calculateStreak(sessions, timezone)`
  - `formatDuration(seconds)`
  - `calculateBMI(weight, height)`
  - `getWeekDayFromDate(date, timezone)` (se necessário para streak/relatórios)

Uso: **api** (use cases, relatórios) e **web** (exibição, métricas).

### 3. Dependências entre pacotes e apps

```
packages/constants  (sem deps de outros packages de domínio)
       ↑
packages/types      (pode depender de constants para enums)
       ↑
packages/validators (depende de zod; pode usar constants para .enum())
       ↑
packages/utils      (pode depender de types/constants se necessário)

apps/api    → @m-move-app/types, validators, utils, constants
apps/web    → @m-move-app/types, validators, utils, constants, ui
apps/mobile → (futuro) mesmos packages
```

### 4. Passos de implementação

1. **Popular `@m-move-app/constants`**  
   Extrair enums do Prisma/schema (ou definir manualmente) e exportar em `packages/constants/src/index.ts`.

2. **Popular `@m-move-app/types`**  
   Definir interfaces e DTOs em `packages/types/src` (e re-exportar enums de constants se quiser). Manter tipos independentes do Prisma para não amarrar o front ao banco.

3. **Popular `@m-move-app/validators`**  
   Mover/criar schemas Zod em `packages/validators/src` (workout, user, auth, etc.). API e web passam a importar daqui.

4. **Popular `@m-move-app/utils`**  
   Implementar `calculateStreak`, `formatDuration`, etc., com testes no próprio package.

5. **Adicionar dependências nas apps**  
   Em `apps/api` e `apps/web`: adicionar no `package.json`:
   - `@m-move-app/types`, `@m-move-app/constants`, `@m-move-app/validators`, `@m-move-app/utils` (e validators com dependência de `zod` onde necessário).

6. **Refatorar a API**
   - Substituir definições locais de tipos por imports de `@m-move-app/types` (e `constants`) onde for contrato público.
   - Usar schemas de `@m-move-app/validators` nos routes/schemas (com extensão local se precisar).
   - Usar `@m-move-app/utils` em use cases (ex.: streak, formatação).

7. **Frontend (futuro)**  
   Ao desenvolver o frontend do zero, adicionar em `apps/web` as dependências `@m-move-app/types`, `@m-move-app/constants`, `@m-move-app/validators` e `@m-move-app/utils`, e usar para tipagem, validação de formulários e helpers.

### 5. Benefícios

- **Uma única fonte de verdade** para tipos, enums e schemas da API.
- **Menos duplicação** e menos risco de API e front divergirem.
- **Alinhamento com as regras** do backend (uso de packages compartilhados).
- **Base pronta para o mobile** ao reutilizar types, validators e utils.

---

## Resumo

| Pacote     | Conteúdo principal                            | Consumidores                |
| ---------- | --------------------------------------------- | --------------------------- |
| constants  | Enums (UserRole, PlanType, WeekDay, etc.)     | types, validators, api, web |
| types      | Interfaces, DTOs, PaginatedResponse           | api, web                    |
| validators | Schemas Zod (workout, auth, assessment…)      | api, web                    |
| utils      | calculateStreak, formatDuration, calculateBMI | api, web                    |

A solução é **popular os quatro pacotes**, **declarar as dependências em api e web** e **refatorar a API (e depois o web)** para importar deles, em vez de definir tudo localmente.
