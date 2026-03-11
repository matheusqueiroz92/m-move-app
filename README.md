# M. Move App

Plataforma **SaaS** de gestão de treinos, voltada a **alunos autônomos**, **personal trainers** e **donos de academias**. Inclui geração de planos de treino com IA, análise de progresso e suporte conversacional.

## Visão geral

- **Monorepo** com [Turborepo](https://turborepo.dev/)
- **Clean Architecture** e **DDD**
- **Multi-tenancy** por plano (Student, Personal Trainer, Gym)
- **RBAC** com papéis: `OWNER`, `PERSONAL_TRAINER`, `STUDENT`, `LINKED_STUDENT`
- **API stateless** (Fastify)
- **TDD** como metodologia de desenvolvimento

## Estrutura do repositório

```
m-move-app/
├── apps/
│   ├── api/          # Backend Fastify (Node.js + TypeScript)
│   ├── web/          # Frontend Next.js (React 19)
│   └── mobile/       # App Mobile Expo (planejado)
├── packages/
│   ├── types/        # Tipagens e DTOs compartilhados
│   ├── validators/   # Schemas Zod compartilhados
│   ├── utils/        # Utilitários (dayjs, formatters, streak, etc.)
│   ├── constants/    # Enums e constantes
│   ├── ui/           # Componentes UI compartilhados
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Stack tecnológica

| Camada       | Tecnologias                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **Backend**  | Node.js, TypeScript, Fastify, Prisma, PostgreSQL, Better Auth, Stripe, OpenAI, Zod, Vitest         |
| **Frontend** | React 19, Next.js 16, TypeScript, Tailwind CSS, ShadCN UI, TanStack Query, Zustand, GSAP, Recharts |
| **Mobile**   | React Native, Expo, TypeScript (planejado)                                                         |

## Pré-requisitos

- **Node.js** >= 22
- **pnpm** 9.x
- **PostgreSQL** (para a API)

## Instalação

```bash
# Clonar e entrar no projeto
cd m-move-app

# Instalar dependências
pnpm install
```

## Scripts principais (raiz)

| Comando            | Descrição                                              |
| ------------------ | ------------------------------------------------------ |
| `pnpm dev`         | Sobe em modo desenvolvimento todos os apps (api + web) |
| `pnpm build`       | Build de todos os apps e packages                      |
| `pnpm lint`        | Executa lint em todo o monorepo                        |
| `pnpm format`      | Formata código com Prettier                            |
| `pnpm check-types` | Verificação de tipos TypeScript                        |

## Desenvolvimento

### Rodar tudo

```bash
pnpm dev
```

- **API**: consulte o README em `apps/api/` para URL e variáveis de ambiente.
- **Web**: geralmente em `http://localhost:3000`.

### Rodar apenas um app

```bash
# Apenas a API
pnpm --filter api dev

# Apenas o frontend
pnpm --filter web dev
```

### Build

```bash
# Build completo
pnpm build

# Build de um app específico
pnpm --filter api build
pnpm --filter web build
```

## Documentação por app

- **[API (Backend)](./apps/api/README.md)** — Fastify, rotas, autenticação, banco de dados, testes.
- **[Web (Frontend)](./apps/web/README.md)** — Next.js, estrutura de pastas, design system, rotas e componentes.

## Princípios do projeto

- **TDD**: testes antes da implementação; ciclo Red → Green → Refactor.
- **SOLID e Clean Code**: responsabilidades bem definidas, código legível e testável.
- **DRY**: lógica compartilhada em packages (`@m-move-app/types`, `validators`, `utils`).
- **TypeScript estrito**: evitar `any`; preferir tipagens compartilhadas.
- **SaaS e multi-tenancy**: isolamento por tenant e respeito aos limites de plano.

## Licença

ISC.
