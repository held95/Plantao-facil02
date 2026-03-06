# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all workspace dependencies
pnpm install

# Run Next.js web app (localhost:3000)
pnpm dev:web
# or
cd apps/web && pnpm dev

# Run Expo mobile app
pnpm dev:mobile
# or
cd apps/mobile && pnpm dev

# Build everything
pnpm build

# Lint everything
pnpm lint
```

No test runner is configured in this project.

## Architecture Overview

**Plantão Fácil** is a Brazilian medical shift scheduling platform. Medical staff can view, apply for, and manage on-call shifts (plantões) at hospitals. It includes an admin approval workflow for new user registrations.

This is a **pnpm + Turborepo monorepo** with three apps and three shared packages.

### Tech Stack

- **Next.js 16 (App Router)** with **React 19** and **TypeScript** — web app
- **Expo ~53 (expo-router ~4)** with **React Native 0.76** — mobile app
- **AWS DynamoDB** as primary database (repository pattern, no ORM)
- **NextAuth v5 (beta)** — Credentials provider, JWT sessions, 30-day expiry
- **TanStack Query v5** — server/async state (caching, polling)
- **Zustand v5** — client-only UI state (notification count, dropdown toggles)
- **Tailwind CSS v4** + **shadcn/ui** — styling and base components (web only)
- **AWS SES** — transactional email
- **AWS SNS** — SMS notifications (Brazilian E.164 format)
- **Expo Notifications** — push notifications (`expo-server-sdk` on backend)

### Monorepo Structure

```
Plantao-facil02/
├── pnpm-workspace.yaml
├── turbo.json
├── package.json              ← root (plantao-facil-monorepo)
├── apps/
│   ├── web/                  ← Next.js app (@plantao/web)
│   │   ├── app/              ← App Router pages + API routes
│   │   ├── components/       ← UI components (shadcn/ui, layout, calendario)
│   │   ├── hooks/            ← TanStack Query hooks
│   │   ├── stores/           ← Zustand stores
│   │   ├── lib/
│   │   │   ├── api/          ← Axios client + API functions
│   │   │   └── data/         ← Mock data (mockPlantoes, mockUsers)
│   │   ├── types/            ← Local type copies (kept for @/* alias compat)
│   │   └── next.config.mjs   ← transpilePackages configured
│   └── mobile/               ← Expo app (@plantao/mobile)
│       ├── app/              ← expo-router pages
│       │   ├── (auth)/       ← login screen
│       │   └── (tabs)/       ← main tabs (plantoes list, notifications)
│       ├── components/       ← PushTokenRegistrar
│       ├── hooks/            ← usePushNotifications
│       └── lib/api/client.ts ← Axios client pointing to web backend
└── packages/
    ├── shared/               ← @plantao/shared
    │   └── src/
    │       ├── types/        ← All domain types (Plantao, User, etc.)
    │       ├── utils/        ← date, formatting, phoneFormatter, status, calendar, filters, cn
    │       ├── validation/   ← plantaoValidation.ts
    │       └── constants/    ← App-wide constants
    ├── backend/              ← @plantao/backend
    │   └── src/
    │       ├── auth/         ← NextAuth config + export
    │       ├── aws/dynamo/   ← DynamoDB client
    │       ├── repositories/ ← authRepository (users, push tokens, password reset)
    │       └── api/          ← routeGuards (requireAuth, requireRole, etc.)
    └── notifications/        ← @plantao/notifications
        └── src/
            ├── email/        ← AWS SES service
            ├── sms/          ← AWS SNS service + templates + notificationHelpers
            ├── push/         ← Expo push service (expo-server-sdk)
            ├── templates/    ← React Email templates (PlantaoCriadoEmail, InscricaoConfirmadaEmail)
            ├── providers/    ← SmsProvider, EmailProvider, PushProvider interfaces
            ├── orchestrator.ts ← dispatchPlantaoCreated (SMS + email + push)
            └── types.ts      ← NotificationEvent, NotificationRecipient, DeliveryLog
```

### Authentication & Authorization

- **User statuses**: `pendente_aprovacao` → `aprovado` | `rejeitado`
- **Roles**: `admin`, `coordenador`, `medico`, `viewer`
- New users are blocked from logging in until an admin approves their account
- Password reset tokens are stored in DynamoDB with TTL (default 60 min)
- Route protection: `requireAuth`, `requireRole`, `requireCoordinator`, `requireAdmin` from `@plantao/backend`

### Database (DynamoDB)

Tables: `plantao_users` and `plantao_password_reset_tokens`

Toggle between real DynamoDB and in-memory mocks via `AUTH_SOURCE` env var:
- `AUTH_SOURCE=mock` — uses in-memory seed data in `authRepository.ts` (no AWS credentials needed)
- `AUTH_SOURCE=dynamodb` — uses real DynamoDB

Mock users all use password: `senha123`

### Notifications Architecture

`packages/notifications/src/orchestrator.ts` exports `dispatchPlantaoCreated(plantao, recipients)`:
- Sends SMS via AWS SNS
- Sends email via AWS SES (React Email templates)
- Sends push via Expo Notifications server SDK

`NotificationRecipient` controls per-user channel opt-in (`smsEnabled`, `emailEnabled`, `pushEnabled`).

Push tokens are stored on user records (DynamoDB `SET` attribute, in-memory for mock mode).

New API endpoints in `apps/web`:
- `POST /api/push-tokens` — register Expo push token
- `DELETE /api/push-tokens` — remove push token

### Environment Variables

See `apps/web/.env.example` and `apps/mobile/.env.example`.

Key variables for `apps/web`:
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

Key variables for `apps/mobile`:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Import Conventions

In `apps/web`:
- `@plantao/shared` — types, utils, validation, constants
- `@plantao/backend` — auth, authRepository, routeGuards
- `@plantao/notifications` — email/SMS/push services, orchestrator
- `@/*` — internal to apps/web (components, hooks, stores, lib/api, lib/data)

### State Management Pattern

- **Server state** (plantões list, notifications, documents): TanStack Query hooks in `hooks/`. Notifications poll every 30s.
- **Client UI state** (unread count, dropdown open/close): Zustand in `stores/`.

### Pending External Setup

1. AWS SES — verify domain/email, request production access
2. AWS SNS — configure spend limits, test with Brazilian numbers
3. AWS DynamoDB — create tables `plantao_users` and `plantao_password_reset_tokens` with GSI
4. Expo EAS — create account, get `projectId` for `apps/mobile/app.json`
5. Distribution — Google Play (Android) and App Store (iOS)
