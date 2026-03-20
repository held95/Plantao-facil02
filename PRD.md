# PRD — Plantão Fácil
**Versão 1.0 · Março 2026**

---

## 1. Visão do Produto

**Plantão Fácil** é uma plataforma brasileira de gestão de plantões médicos que conecta hospitais a profissionais de saúde. Coordenadores publicam plantões com detalhes de especialidade, horário e remuneração; médicos candidatam-se e gerenciam sua agenda; administradores aprovam cadastros e mantêm a operação.

**Problema central:** hospitais dependem de WhatsApp e e-mail para distribuir escalas, documentos operacionais e comunicados — sem rastreabilidade, sem confirmação de leitura e sem vínculo com o plantão correspondente.

**Proposta de valor:**
- Centralizar escala, candidaturas, documentos e notificações em um único sistema
- Eliminar ambiguidade sobre quem leu o quê e quando
- Reduzir carga administrativa de coordenadores (estimativa do setor: 8,7h/semana em tarefas manuais)

---

## 2. Personas

| Persona | Papel | Objetivos Primários |
|---------|-------|---------------------|
| **Admin** | Gestor do sistema | Aprovar cadastros, gerenciar coordenadores, acessar logs de auditoria |
| **Coordenador** | Gestor de plantões | Publicar plantões, enviar documentos, monitorar candidaturas |
| **Médico** | Profissional de saúde | Consultar plantões disponíveis, candidatar-se, receber notificações e documentos |

---

## 3. Funcionalidades — Estado Atual (v1.0 implementado)

### 3.1 Gestão de Plantões

| Funcionalidade | Status | Quem pode |
|---|---|---|
| Listar plantões disponíveis (calendário e lista) | ✅ | Todos |
| Criar plantão com especialidade, horário, valor, requisitos | ✅ | Coordenador, Admin |
| Excluir plantão | ✅ | Criador ou Admin |
| Candidatar-se a plantão | ✅ | Médico |
| Cancelar candidatura | ✅ | Médico |
| Visualizar plantões por especialidade/período | ✅ | Todos |
| Visualização em calendário mensal | ✅ | Todos |
| Gerenciar plantões próprios | ✅ | Coordenador, Admin |

### 3.2 Autenticação & Gerenciamento de Usuários

| Funcionalidade | Status | Quem pode |
|---|---|---|
| Registro com e-mail e senha | ✅ | Público |
| Aprovação/rejeição de cadastro pendente | ✅ | Admin, Coordenador |
| Login com sessão JWT (30 dias) | ✅ | Aprovados |
| Recuperação de senha via token (TTL configurável) | ✅ | Todos |
| Gerenciar coordenadores | ✅ | Admin |
| Visualizar logs de auditoria | ✅ | Admin |

### 3.3 Notificações

| Canal | Status | Trigger |
|---|---|---|
| E-mail (AWS SES) | ✅ | Criação de plantão |
| SMS (AWS SNS) | ✅ | Criação de plantão |
| Push (Expo Notifications) | ✅ | Criação de plantão |
| In-app badge + dropdown | ✅ | Polling 30s |

### 3.4 Gestão de Documentos (Intranet)

| Funcionalidade | Status | Quem pode |
|---|---|---|
| Upload de PDF vinculado a plantão (máx. 20MB) | ✅ | Coordenador, Admin |
| Listagem de documentos por plantão | ✅ | Todos |
| Visualização inline via presigned URL (iframe) | ✅ | Todos |
| Download de PDF | ✅ | Todos |
| Rastreio de leitura por usuário | ✅ | — |
| Badge de documentos não lidos na Navbar | ✅ | Todos |
| Dropdown com documentos recentes | ✅ | Todos |
| Marcar todos como vistos | ✅ | Todos |
| Fallback informativo em modo mock | ✅ | — |

### 3.5 App Mobile (Expo)

| Funcionalidade | Status |
|---|---|
| Listagem de plantões | ✅ |
| Autenticação | ✅ |
| Notificações push | ✅ |
| Seção de documentos | 🔲 Roadmap |

---

## 4. Requisitos Não-Funcionais

### 4.1 Performance

| Métrica | Target |
|---|---|
| Listagem de plantões (p95) | < 500ms |
| Geração de presigned URL S3 | < 200ms |
| Polling de notificações | 30s (TanStack Query `refetchInterval`) |
| TTL de presigned URL | 3600s (configurável via `AWS_S3_PRESIGN_TTL_SECONDS`) |

### 4.2 Disponibilidade

- Target: **99,5% uptime mensal** (alinhado com SLA do Vercel Pro + AWS)
- Hospitais operam 24/7 — o sistema deve ser tolerante a falhas de notificação sem afetar o core (plantões e documentos)
- Feature flags (`ENABLE_EMAIL_NOTIFICATIONS`, `ENABLE_SMS_NOTIFICATIONS`, `ENABLE_DOCUMENT_STORAGE`) permitem degradação graceful por serviço

### 4.3 Segurança

| Controle | Implementação |
|---|---|
| Autenticação | NextAuth.js v5 + Credentials provider + JWT 30 dias |
| Autorização | Route guards: `requireAuth`, `requireRole`, `requireCoordinator`, `requireAdmin` |
| Acesso a documentos | Presigned URLs S3 (expiram em 1h, sem credenciais AWS no browser) |
| Armazenamento S3 | Block Public Access habilitado; acesso apenas via presigned URL |
| Senhas | Hash (gerenciado pelo NextAuth) |
| IAM mínimo | Apenas `s3:PutObject` + `s3:GetObject` no bucket de documentos |

### 4.4 Conformidade LGPD

O sistema processa **dados pessoais sensíveis** (CPF, CRM, telefone, e-mail) de profissionais de saúde. Obrigações aplicáveis:

| Obrigação | Status | Ação requerida |
|---|---|---|
| Base legal para tratamento | 🔲 | Documentar base legal (legítimo interesse / contrato) |
| Consentimento explícito para notificações | 🔲 | Adicionar opt-in de canais no cadastro |
| Política de privacidade | 🔲 | Criar e linkar no app |
| Política de retenção de dados | 🔲 | Definir TTL de dados inativos (ex: 2 anos) |
| Direito ao esquecimento | 🔲 | Implementar endpoint de exclusão de conta |
| Audit log imutável | ✅ | Tabela `plantao_logs` (parcial) |
| Criptografia em trânsito | ✅ | HTTPS/TLS (Vercel + AWS) |

### 4.5 Auditoria

Toda ação crítica deve gerar entrada no log de auditoria:
- Upload/exclusão de documentos
- Aprovação/rejeição de usuários
- Criação/exclusão de plantões
- Alterações de role

---

## 5. Arquitetura

### 5.1 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui |
| Estado servidor | TanStack Query v5 (polling 30s) |
| Estado UI | Zustand v5 com persist middleware |
| API | Next.js Route Handlers (App Router) |
| Storage | AWS S3 com presigned URLs |
| Database | AWS DynamoDB (PAY_PER_REQUEST) |
| Auth | NextAuth.js v5 beta |
| E-mail | AWS SES + React Email templates |
| SMS | AWS SNS (formato E.164 brasileiro) |
| Push | Expo Notifications (expo-server-sdk) |
| Mobile | Expo v53 + expo-router v4 + React Native 0.76 |
| Monorepo | pnpm workspaces + Turborepo |

### 5.2 Estrutura do Monorepo

```
Plantao-facil02/
├── apps/
│   ├── web/          @plantao/web    (Next.js — app principal)
│   └── mobile/       @plantao/mobile (Expo)
└── packages/
    ├── shared/       @plantao/shared       (tipos, utils, validação, constantes)
    ├── backend/      @plantao/backend      (auth, repositories, route guards, AWS)
    └── notifications/ @plantao/notifications (email, SMS, push, orchestrator)
```

### 5.3 Decisões Arquiteturais

**Por que Next.js API Routes (não backend separado)?**
Serverless no Vercel elimina gestão de infraestrutura. O projeto não precisa de WebSockets nem de computação de longa duração — Route Handlers são suficientes e têm cold start < 200ms.

**Por que polling (30s) e não WebSockets/SSE?**
O projeto já usa `refetchInterval: 30000` em `useNotifications()`. SSE tem timeout de 10s no plano Hobby do Vercel; WebSockets exigem servidor persistente. Polling garante consistência sem nova infraestrutura.

**Por que DynamoDB (não PostgreSQL)?**
Carga de leitura altamente variável com picos previsíveis (publicação de escala). PAY_PER_REQUEST elimina over-provisioning. Single-table design com GSIs cobre todos os padrões de acesso necessários.

**Por que S3 com presigned URLs?**
Upload server-side usa `request.formData()` nativo do App Router — sem exposição de credenciais AWS ao browser, sem configuração de CORS no bucket.

**Por que `<iframe>` para PDF (não react-pdf)?**
Todos os navegadores modernos têm renderizador nativo de PDF. `react-pdf` adicionaria ~500KB ao bundle sem benefício real para este caso de uso.

### 5.4 Fluxo de Upload de Documentos

```
[Admin/Coord — Browser]
        │  POST multipart/form-data /api/plantoes/{id}/documentos
        ▼
[Next.js Route Handler]
        ├──► S3 PutObject        (documentStorage.uploadBuffer)
        ├──► DynamoDB PutItem    (documentRepository.createDocument)
        └──► Response: { documento, downloadUrl }
                └──► invalidateQueries(['documentos','plantao',id])
```

### 5.5 Fluxo de Notificações de Documentos

```
[Usuário logado] — GET /api/notificacoes/documentos?since={lastCheckedAt} (30s)
        ▼
[API] documentRepository.listUploadedAfter(since)
      documentRepository.getReadStatusBatch(docIds, userId)
        ▼
[Response] { unreadCount, recentes }
        ▼
[documentNotificationStore.setUnreadCount(n)]
        ▼
[Badge FileText na Navbar]

[Usuário clica → /plantoes/{id}?tab=documentos]
        ▼
[PDFViewer (iframe)] + useMarkDocumentoAsViewed.mutate(docId)
        ▼
[POST /api/documentos/{id}/visualizado → unreadCount atualizado]
```

---

## 6. Schema DynamoDB

### Tabela `plantao_users`

```
PK: pk = "USER#<id>"

Atributos: id, nome, email, role, status, telefone, crm, pushTokens[], createdAt
GSI: email-index (hash: email)
```

### Tabela `plantao_password_reset_tokens`

```
PK: pk = "TOKEN#<token>"
Atributos: token, userId, email, expiresAt, used
```

### Tabela `plantao_plantoes`

```
PK: pk = "PLANTAO#<id>"
Atributos: id, hospital, especialidade, data, horarioInicio, horarioFim,
           valor, status, descricao, requisitos[], vagasDisponiveis, vagasTotal,
           cidade, estado, criadoPor, criadoEm
```

### Tabela `plantao_documents`

```
PK: pk = "DOCUMENT#<uuid>"   SK: sk = "METADATA"

Atributos:
  id, plantaoId, titulo, descricao?, fileName, s3Key, s3Bucket,
  mimeType, tamanhoBytes, uploadedBy, uploadedByNome?, uploadedAt,
  status ("ativo" | "arquivado"), entityType = "DOCUMENT"
  gsi1pk = "PLANTAO#<plantaoId>"    ← GSI-1 (plantaoId-index)
  gsi2pk = "USER#<uploadedBy>"      ← GSI-2 (uploadedBy-index)

GSI-1 "plantaoId-index":  Hash: gsi1pk · Sort: uploadedAt
GSI-2 "uploadedBy-index": Hash: gsi2pk · Sort: uploadedAt
```

### Tabela `plantao_document_reads`

```
PK: pk = "READ#<documentId>"   SK: sk = "USER#<userId>"

Atributos: documentId, userId, visualizadoAt, entityType = "DOCUMENT_READ"
  gsi1pk = "USER#<userId>"   gsi1sk = visualizadoAt   ← GSI-1 (userId-index)

GSI-1 "userId-index": Hash: gsi1pk · Sort: gsi1sk
```

---

## 7. API Endpoints

### Plantões

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/plantoes` | `requireAuth` | Lista todos os plantões |
| `POST` | `/api/plantoes` | `requireCoordinator` | Cria plantão; body: `notificationChannels: 'sms'\|'email'\|'ambos'` |
| `DELETE` | `/api/plantoes/[id]` | `requireAuth` | Exclui plantão (criador ou admin) |
| `POST` | `/api/plantoes/[id]/inscricao` | `requireAuth` | Candidata-se ao plantão |
| `DELETE` | `/api/plantoes/[id]/inscricao` | `requireAuth` | Cancela candidatura |
| `GET` | `/api/plantoes/[id]/documentos` | `requireAuth` | Lista documentos com status de leitura |
| `POST` | `/api/plantoes/[id]/documentos` | `requireCoordinator` | Upload multipart/form-data |

### Documentos

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/documentos/[id]` | `requireAuth` | Detalhes + presigned URL de download |
| `POST` | `/api/documentos/[id]/visualizado` | `requireAuth` | Marca como lido |
| `GET` | `/api/documentos/[id]/download` | `requireAuth` | Fallback mock mode |
| `GET` | `/api/notificacoes/documentos` | `requireAuth` | Polling: `{ unreadCount, recentes }` |

### Admin & Auth

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/admin/pending-users` | `requireAdmin` | Lista cadastros pendentes |
| `POST` | `/api/admin/pending-users/[id]/approve` | `requireAdmin` | Aprova usuário |
| `POST` | `/api/admin/pending-users/[id]/reject` | `requireAdmin` | Rejeita usuário |
| `GET\|POST` | `/api/coordenadores` | `requireAdmin` | Lista/cria coordenadores |
| `GET` | `/api/logs` | `requireAdmin` | Log de auditoria |
| `POST` | `/api/auth/register` | — | Registro de novo usuário |
| `POST` | `/api/auth/forgot-password` | — | Inicia reset de senha |
| `POST` | `/api/auth/reset-password` | — | Conclui reset com token |
| `POST\|DELETE` | `/api/push-tokens` | `requireAuth` | Registra/remove push token Expo |

### Parâmetros — POST `/api/plantoes/[id]/documentos`
Multipart form-data:
- `arquivo` (File, obrigatório) — PDF, máx. 20MB
- `titulo` (string, obrigatório) — máx. 120 chars
- `descricao` (string, opcional) — máx. 300 chars

### Parâmetros — GET `/api/notificacoes/documentos`
- `?since` (ISO string, opcional) — janela de busca (default: 7 dias atrás)

---

## 8. Variáveis de Ambiente

```bash
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
AUTH_SOURCE=mock                          # mock | dynamodb

# AWS (compartilhado por SES, SNS, DynamoDB, S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# E-mail (SES)
ENABLE_EMAIL_NOTIFICATIONS=false
AWS_SES_FROM_EMAIL=noreply@plantaofacil.com
AWS_SES_REPLY_TO=suporte@plantaofacil.com

# SMS (SNS)
ENABLE_SMS_NOTIFICATIONS=false

# DynamoDB
AWS_DYNAMODB_USERS_TABLE=plantao_users
AWS_DYNAMODB_RESET_TABLE=plantao_password_reset_tokens
AWS_DYNAMODB_USERS_EMAIL_GSI=email-index
AWS_DYNAMODB_PLANTOES_TABLE=plantao_plantoes
PASSWORD_RESET_TOKEN_TTL_MINUTES=60

# Document Storage (S3 + DynamoDB)
ENABLE_DOCUMENT_STORAGE=false
AWS_S3_DOCUMENTS_BUCKET=plantao-facil-documentos
AWS_S3_PRESIGN_TTL_SECONDS=3600
AWS_DYNAMODB_DOCUMENTS_TABLE=plantao_documents
AWS_DYNAMODB_DOCUMENT_READS_TABLE=plantao_document_reads

# App
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Plantão Fácil
```

> Em desenvolvimento: `AUTH_SOURCE=mock` + `ENABLE_DOCUMENT_STORAGE=false` — sistema funciona completamente offline sem AWS.

---

## 9. Mock Mode (Desenvolvimento)

| Condição | Comportamento |
|---|---|
| `AUTH_SOURCE=mock` | Todos os repositórios usam stores in-memory com dados de seed |
| `ENABLE_DOCUMENT_STORAGE=false` | `uploadBuffer()` é no-op; `getPresignedDownloadUrl()` retorna `null` |
| Sem presigned URL | Download aponta para `/api/documentos/[id]/download` (texto informativo) |
| Seed users | admin, coordenador e médico com senha `senha123` |
| Seed documents | Um documento vinculado ao plantão de ID `'1'` |

---

## 10. Setup AWS (Produção)

### S3

```bash
aws s3api create-bucket \
  --bucket plantao-facil-documentos \
  --region us-east-1

aws s3api put-public-access-block \
  --bucket plantao-facil-documentos \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### DynamoDB — `plantao_documents`

```bash
aws dynamodb create-table \
  --table-name plantao_documents \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=gsi1pk,AttributeType=S \
    AttributeName=uploadedAt,AttributeType=S \
    AttributeName=gsi2pk,AttributeType=S \
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
  --global-secondary-indexes \
    "[{\"IndexName\":\"plantaoId-index\",\"Keys\":[{\"AttributeName\":\"gsi1pk\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"uploadedAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"uploadedBy-index\",\"Keys\":[{\"AttributeName\":\"gsi2pk\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"uploadedAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --billing-mode PAY_PER_REQUEST
```

### DynamoDB — `plantao_document_reads`

```bash
aws dynamodb create-table \
  --table-name plantao_document_reads \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=gsi1pk,AttributeType=S \
    AttributeName=gsi1sk,AttributeType=S \
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
  --global-secondary-indexes \
    "[{\"IndexName\":\"userId-index\",\"Keys\":[{\"AttributeName\":\"gsi1pk\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"gsi1sk\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --billing-mode PAY_PER_REQUEST
```

### IAM Policy (adicionar ao usuário IAM existente)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::plantao-facil-documentos/*"
    }
  ]
}
```

---

## 11. Como Testar

### Mock Mode (sem AWS)

```bash
cd apps/web
# .env.local: AUTH_SOURCE=mock, ENABLE_DOCUMENT_STORAGE=false
pnpm dev

# 1. Login como coordenador (helder@plantaofacil.com / senha123)
# 2. Ir ao plantão #1 → aba "Documentos"
# 3. "Enviar Documento" → selecionar PDF → preencher título → Enviar
# 4. Documento aparece na lista (documento seed também visível)
# 5. Badge FileText na Navbar mostra "1"
# 6. Clicar no documento → PDFViewer (mock: mensagem informativa)
# 7. Badge desaparece
#
# 8. Login como médico (carlos@plantaofacil.com / senha123)
# 9. Em até 30s o badge FileText aparece com "1"
```

### Com AWS Real

```bash
# .env.local: AUTH_SOURCE=dynamodb, ENABLE_DOCUMENT_STORAGE=true
# Confirmar tabelas DynamoDB criadas com GSIs corretos
# Confirmar bucket S3 com Block Public Access
# IAM com s3:PutObject + s3:GetObject

# Verificar presigned URL:
# 1. Upload de PDF → copiar downloadUrl da resposta JSON
# 2. Abrir URL no browser → PDF renderiza sem login AWS
```

---

## 12. Roadmap

### Alta Prioridade

| Feature | Justificativa |
|---|---|
| **Troca de plantão entre médicos** (swap request) | ~30% de ausências no dia em sistemas similares; swap reduz custo operacional |
| **Detecção de conflitos de escala** (double-booking) | Padrão em todos os sistemas profissionais de rostering (NHS Rotageek, RosterLab) |
| **Conformidade LGPD** — opt-in de canais, política de privacidade, direito ao esquecimento | Obrigação legal para dados de profissionais de saúde no Brasil |
| **Notificações push ao criar documento** | Integrar ao `dispatchPlantaoCreated` para enviar push/email ao upload de documento |

### Média Prioridade

| Feature | Justificativa |
|---|---|
| **Documentos no app mobile** | Expo app sem seção de documentos; médicos usam principalmente mobile |
| **Arquivamento de documentos** | Botão "Arquivar" para admin (status: 'arquivado') |
| **Dashboard analytics para admin** | Setor reporta economia de 1.200h/mês em sistemas com analytics de cobertura |
| **Plantões recorrentes** (séries semanais/mensais) | Hospitais operam em ciclos regulares |
| **Integração de calendário externo** (Google Calendar / Apple Calendar) | Expectativa padrão de apps de agendamento modernos |
| **Busca e filtros de documentos** | Filtrar por título, data, tipo |

### Baixa Prioridade

| Feature | Justificativa |
|---|---|
| **Export de escala** (PDF/CSV) | Obrigação trabalhista de manter registros físicos |
| **Múltiplos arquivos por upload** | Upload em lote de vários PDFs |
| **Versioning de documentos** | Substituir documento mantendo histórico de versões |
| **CloudFront à frente do S3** | CDN para melhor performance de PDFs em regiões distantes |
| **Audit log de documentos** | Registrar uploads/downloads na tabela de logs existente |

---

## 13. Referências

### Padrões de Código Seguidos

- **Repository pattern** — replicado de `plantaoRepository.ts` (mock + DynamoDB dual-mode)
- **Polling TanStack Query** — replicado de `useNotifications.ts` (`refetchInterval: 30000`)
- **Zustand store** — replicado de `notificationStore.ts` (com persist middleware)
- **Feature flag** — replicado de `ENABLE_EMAIL_NOTIFICATIONS` em `awsSesService.ts`
- **Route guards** — `requireAuth`, `requireCoordinator` de `@plantao/backend`

### Benchmarks de Mercado

- [NHS Rotageek](https://www.rotageek.com/industries/healthcare) — rostering hospitalar com analytics
- [RosterLab](https://rosterlab.com/industries/healthcare) — otimização por IA de escalas
- [Core Schedule](https://coreschedule.com/) — scheduling para times de saúde
- Redução de 94% em conflitos com detecção automatizada (MyShyft, 2024)
- Economia de 1.200h/mês em sistema de 12 unidades com automação de conflitos

### Documentação Técnica

- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [Next.js App Router — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TanStack Query — Polling](https://tanstack.com/query/latest/docs/framework/react/guides/polling)
- [Zustand persist middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [DynamoDB Single Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/)
- [LGPD — Lei Geral de Proteção de Dados](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
