# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production build locally
npm run lint     # Run ESLint
```

No test runner is configured in this project.

## Architecture Overview

**Plantão Fácil** is a Brazilian medical shift scheduling platform. Medical staff can view, apply for, and manage on-call shifts (plantões) at hospitals. It includes an admin approval workflow for new user registrations.

### Tech Stack

- **Next.js 16 (App Router)** with **React 19** and **TypeScript**
- **AWS DynamoDB** as primary database (repository pattern, no ORM)
- **NextAuth v5 (beta)** — Credentials provider, JWT sessions, 30-day expiry
- **TanStack Query v5** — server/async state (caching, polling)
- **Zustand v5** — client-only UI state (notification count, dropdown toggles)
- **Tailwind CSS v4** + **shadcn/ui** — styling and base components
- **AWS SES** — transactional email; **AWS SNS** — SMS notifications

### Directory Structure

```
app/
  api/              # Route handlers (auth, plantoes, admin, logs, notificacoes)
  providers.tsx     # SessionProvider + QueryClientProvider setup
  layout.tsx        # Root layout
  [pages]/          # login, signup, plantoes, calendario, inscricoes, gerenciar, logs, etc.

lib/
  auth/config.ts    # NextAuth configuration
  auth.ts           # NextAuth export used across the app
  aws/dynamo/       # DynamoDB client + authRepository (users, password reset tokens)
  email/            # AWS SES email service + templates
  sms/              # AWS SNS SMS service + templates + notificationHelpers
  api/              # Axios client (client.ts) + API functions per domain
  utils/            # date (pt-BR), formatting (CPF/CRM/phone), calendar, filters, status
  data/             # Mock data (mockPlantoes, mockUsers, etc.) for development
  constants.ts      # App-wide constants

components/
  ui/               # shadcn/ui base components
  layout/           # Navbar, NotificationDropdown
  calendario/       # Calendar-specific components
  common/           # Shared (Logo, etc.)

stores/             # Zustand stores: plantaoStore, notificationStore
hooks/              # Custom React Query hooks: useNotifications, useDocuments
types/              # TypeScript interfaces: plantao, user, auth, notification, log, etc.
```

### Authentication & Authorization

- **User statuses**: `pendente_aprovacao` → `aprovado` | `rejeitado`
- **Roles**: `admin`, `coordenador`, `medico`, `viewer`
- New users are blocked from logging in until an admin approves their account
- Password reset tokens are stored in DynamoDB with TTL (default 60 min)
- Route protection is done via `auth()` from NextAuth in API handlers and `routeGuards.ts` for pages

### Database (DynamoDB)

Tables: `plantao_users` and `plantao_password_reset_tokens`

The `authRepository.ts` provides the data access layer. Key methods: `findByEmail`, `findById`, `createPendingUser`, `approvePendingUser`, `getPendingUsers`.

Toggle between real DynamoDB and in-memory mocks via `AUTH_SOURCE` env var:
- `AUTH_SOURCE=mock` — uses `lib/data/mockUsers.ts` (no AWS credentials needed)
- `AUTH_SOURCE=dynamodb` — uses real DynamoDB

### Environment Variables

Copy `.env.example` to `.env.local`. Key variables:

```
NEXTAUTH_URL, NEXTAUTH_SECRET
AUTH_SOURCE=mock|dynamodb
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
AWS_DYNAMODB_USERS_TABLE, AWS_DYNAMODB_RESET_TABLE, AWS_DYNAMODB_USERS_EMAIL_GSI
ENABLE_EMAIL_NOTIFICATIONS=true|false
AWS_SES_FROM_EMAIL
ENABLE_SMS_NOTIFICATIONS=true|false
APP_BASE_URL
NEXT_PUBLIC_API_BASE_URL
```

### State Management Pattern

- **Server state** (plantões list, notifications, documents): TanStack Query hooks in `hooks/`. Notifications poll every 30s.
- **Client UI state** (unread count, dropdown open/close): Zustand in `stores/`.
- Both providers are initialized in `app/providers.tsx`.

### Tailwind Custom Colors

The Tailwind config extends with status-specific colors matching shift states: `aberto`, `futuro`, `fechado`, `pendente`, `confirmado`, `cancelado`. Use `status.ts` utility for mapping status → color/label.
