# Plantão Fácil

Plataforma de gestão de plantões médicos para hospitais e médicos no Brasil.

## Monorepo

Este projeto usa **pnpm workspaces** + **Turborepo**.

```
apps/
  web/     — Next.js 16 (interface web + API backend)
  mobile/  — Expo React Native (app móvel)
packages/
  shared/        — tipos, utils, validação, constantes (usado por web e mobile)
  backend/       — auth (NextAuth), DynamoDB, repositórios, routeGuards
  notifications/ — AWS SES (email), AWS SNS (SMS), Expo Push Notifications, orquestrador
```

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)
- Conta AWS (para SES, SNS, DynamoDB em produção)
- Conta [Expo EAS](https://expo.dev/) (para push notifications em produção)

## Instalação

```bash
pnpm install
```

## Rodar em desenvolvimento

```bash
# Web (localhost:3000)
pnpm dev:web

# Mobile (Expo DevTools)
pnpm dev:mobile
```

O modo web funciona sem AWS credenciais usando `AUTH_SOURCE=mock`:

```bash
cd apps/web
cp .env.example .env.local
# Edite .env.local: AUTH_SOURCE=mock, NEXTAUTH_SECRET=qualquer-string
pnpm dev
```

Login mock: email `admin@plantaofacil.com`, senha `senha123`

## Variáveis de ambiente

- `apps/web/.env.example` — configuração do app web
- `apps/mobile/.env.example` — configuração do app mobile

## Notificações

### AWS SES (email)

1. Verifique seu domínio ou email no AWS SES console
2. Solicite saída do sandbox para envio a usuários reais
3. Configure `AWS_SES_FROM_EMAIL` e `ENABLE_EMAIL_NOTIFICATIONS=true`

### AWS SNS (SMS)

1. Configure `ENABLE_SMS_NOTIFICATIONS=true`
2. Configure gasto mensal máximo no AWS SNS console (Preferences > Text messaging)
3. Teste com número no formato `+55XXXXXXXXXXX` (E.164 brasileiro)

### Expo Push Notifications (mobile)

1. Crie um projeto no [expo.dev](https://expo.dev)
2. Adicione o `projectId` em `apps/mobile/app.json`
3. Instale `expo-notifications` no app mobile
4. O componente `PushTokenRegistrar` registra automaticamente o token após login
5. Tokens são salvos via `POST /api/push-tokens`
6. O orquestrador envia push ao criar plantões via `dispatchPlantaoCreated`

## AWS DynamoDB

Tabelas necessárias:

| Tabela | PK | SK | GSI |
|--------|----|----|-----|
| `plantao_users` | `pk` (USER#id) | — | `gsi1pk` (EMAIL#email) → `gsi1sk` |
| `plantao_password_reset_tokens` | `tokenHash` | — | TTL: `expiresAt` |

## Arquitetura de notificações

```
POST /api/plantoes
  └── dispatchPlantaoCreated(plantao, recipients)
        ├── awsSnsService.sendPlantaoCriadoSMS   (SMS por usuário)
        ├── awsSesService.sendPlantaoCriadoEmail  (email por usuário)
        └── expoPushService.send                  (push por token)
```

Cada canal retorna um `DeliveryLog` com status `sent` | `failed`.

## Build de produção

```bash
pnpm build
```

## Lint

```bash
pnpm lint
```
