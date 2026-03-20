# spec.md — Plantão Fácil
**Especificação Técnica de Implementação · Baseada no PRD v1.0 · Março 2026**

Mapeia cada feature do roadmap (PRD §12) para arquivos concretos a criar ou modificar, seguindo os padrões arquiteturais já estabelecidos no projeto (repository pattern, TanStack Query, Zustand, feature flags).

---

## Índice

### Alta Prioridade
1. [Notificações push/email ao criar documento](#1-notificações-pushemail-ao-criar-documento)
2. [Troca de plantão entre médicos (swap request)](#2-troca-de-plantão-entre-médicos-swap-request)
3. [Detecção de conflitos de escala (double-booking)](#3-detecção-de-conflitos-de-escala-double-booking)
4. [Conformidade LGPD](#4-conformidade-lgpd)

### Média Prioridade
5. [Documentos no app mobile](#5-documentos-no-app-mobile)
6. [Arquivamento de documentos](#6-arquivamento-de-documentos)
7. [Dashboard analytics para admin](#7-dashboard-analytics-para-admin)
8. [Plantões recorrentes](#8-plantões-recorrentes)
9. [Busca e filtros de documentos](#9-busca-e-filtros-de-documentos)

### Baixa Prioridade
10. [Export de escala (PDF/CSV)](#10-export-de-escala-pdfcsv)
11. [Múltiplos arquivos por upload](#11-múltiplos-arquivos-por-upload)
12. [Versioning de documentos](#12-versioning-de-documentos)
13. [Audit log de documentos](#13-audit-log-de-documentos)
14. [CloudFront à frente do S3](#14-cloudfront-à-frente-do-s3)

---

## ALTA PRIORIDADE

---

### 1. Notificações push/email ao criar documento

**Descrição:** Quando um coordenador faz upload de um documento vinculado a um plantão, todos os médicos inscritos naquele plantão devem receber notificação push (Expo) e/ou e-mail, seguindo as preferências de canal de cada usuário. Hoje o upload já funciona, mas não dispara notificações.

**Dependências:** Feature de upload de documentos já implementada. Orchestrator de notificações existente em `packages/notifications/src/orchestrator.ts`.

---

#### Arquivos a CRIAR

| Arquivo | O que fazer |
|---|---|
| `packages/notifications/src/templates/DocumentoCriadoEmail.tsx` | Template React Email para notificação de novo documento. Props: `{ medicoNome, coordenadorNome, plantaoHospital, documentoTitulo, plantaoUrl }`. Seguir padrão de `PlantaoCriadoEmail.tsx`. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/notifications/src/types.ts` | Adicionar `'DOCUMENTO_CRIADO'` ao union type `NotificationEvent`. |
| `packages/notifications/src/sms/templates.ts` | Adicionar função `getDocumentoCriadoMessage(params: { medicoNome, plantaoHospital, documentoTitulo }): string` com texto SMS ≤ 160 chars. |
| `packages/notifications/src/orchestrator.ts` | Adicionar função `dispatchDocumentoCriado(documento: PlantaoDocumento, recipients: NotificationRecipient[]): Promise<DeliveryLog[]>`. Reutilizar padrão de `dispatchPlantaoCreated` (SMS + email + push em paralelo, fire-and-forget). |
| `packages/notifications/src/index.ts` | Exportar `dispatchDocumentoCriado`. |
| `apps/web/app/api/plantoes/[id]/documentos/route.ts` | Após `documentRepository.createDocument(...)`, buscar médicos inscritos no plantão via `plantaoRepository`, montar array de `NotificationRecipient` e chamar `dispatchDocumentoCriado` (sem await, log de erro). Proteger com `ENABLE_EMAIL_NOTIFICATIONS` / feature flag similar. |

---

#### Notas de implementação

- Reutilizar a lógica de montagem de `NotificationRecipient` do endpoint `POST /api/plantoes` (criação de plantão).
- Médicos inscritos: buscar campo `inscricoes` do plantão. Se ainda mock, iterar `mockUsers` filtrando quem está inscrito.
- Push: reutilizar `expoPushService.sendToTokens(pushTokens, payload)`.

---

### 2. Troca de plantão entre médicos (swap request)

**Descrição:** Um médico inscrito em um plantão pode propor troca com outro médico que também esteja inscrito em outro plantão. O médico alvo recebe notificação e pode aceitar ou rejeitar. Se aceito, as inscrições são trocadas.

**Dependências:** Sistema de inscrição existente. Notificações existentes. Novo tipo DynamoDB: `plantao_swap_requests`.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `packages/shared/src/types/swapRequest.ts` | Tipo `SwapRequest { id, solicitanteId, solicitanteNome, destinatarioId, destinatarioNome, plantaoOrigemId, plantaoDestinoId, status: 'pendente' \| 'aceito' \| 'rejeitado' \| 'cancelado', criadoEm, resolvidoEm? }`. |
| `packages/backend/src/repositories/swapRepository.ts` | Repository com mock (Map in-memory) + DynamoDB condicional (`AUTH_SOURCE`). Métodos: `createSwapRequest`, `getById`, `listByUserId`, `updateStatus`. |
| `apps/web/app/api/plantoes/[id]/swap/route.ts` | `POST`: cria SwapRequest (validar: solicitante está inscrito no plantão de origem, status do plantão é 'disponivel' ou 'confirmado'). `GET`: lista swaps relacionados ao plantão. Guard: `requireAuth`. |
| `apps/web/app/api/swap/[id]/aceitar/route.ts` | `POST`: valida destinatário, troca inscrições nos dois plantões, atualiza `status → 'aceito'`. Guard: `requireAuth`. |
| `apps/web/app/api/swap/[id]/rejeitar/route.ts` | `POST`: atualiza `status → 'rejeitado'`. Guard: `requireAuth`. |
| `apps/web/hooks/useSwapRequests.ts` | TanStack Query hook: `useQuery(['swap', 'recebidos', userId])` polling 30s. Mutation `useMutation` para aceitar/rejeitar. |
| `apps/web/components/plantoes/SwapRequestModal.tsx` | Dialog para propor troca: seletor de plantão destino (lista plantões do médico), botão "Propor". |
| `apps/web/components/plantoes/SwapRequestList.tsx` | Lista de propostas recebidas: nome do solicitante, plantão origem/destino, botões "Aceitar"/"Rejeitar". |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/shared/src/index.ts` | Exportar `SwapRequest` de `./types/swapRequest`. |
| `packages/backend/src/index.ts` | Exportar `swapRepository`. |
| `apps/web/app/plantoes/[id]/page.tsx` | Se médico logado e inscrito: exibir botão "Propor Troca" que abre `SwapRequestModal`. |
| `apps/web/app/inscricoes/page.tsx` | Adicionar seção "Trocas Pendentes" com `SwapRequestList` (propostas recebidas pelo médico logado). |
| `packages/notifications/src/types.ts` | Adicionar `'SWAP_PROPOSTO' \| 'SWAP_ACEITO' \| 'SWAP_REJEITADO'` ao `NotificationEvent`. |
| `packages/notifications/src/orchestrator.ts` | Adicionar `dispatchSwapProposto`, `dispatchSwapAceito`, `dispatchSwapRejeitado`. |
| `packages/notifications/src/index.ts` | Exportar novas funções de dispatch. |

---

#### Schema DynamoDB (novo)

```
Tabela: plantao_swap_requests
PK: pk = "SWAP#<id>"
Atributos: id, solicitanteId, destinatarioId, plantaoOrigemId, plantaoDestinoId, status, criadoEm, resolvidoEm?
GSI-1 "solicitante-index": Hash: gsi1pk = "USER#<solicitanteId>" · Sort: criadoEm
GSI-2 "destinatario-index": Hash: gsi2pk = "USER#<destinatarioId>" · Sort: criadoEm
```

Adicionar à variável `AWS_DYNAMODB_SWAP_REQUESTS_TABLE` em `.env.example`.

---

### 3. Detecção de conflitos de escala (double-booking)

**Descrição:** Antes de confirmar uma inscrição em plantão, verificar se o médico já possui outro plantão confirmado no mesmo intervalo de horário. Se houver conflito, retornar erro 409 com detalhes. Exibir aviso no frontend antes mesmo do submit.

**Dependências:** `plantaoRepository` existente. Rota de inscrição existente.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `packages/shared/src/utils/conflictDetection.ts` | Função `detectScheduleConflict(plantaoA: Plantao, plantaoB: Plantao): boolean`. Lógica: dois plantões conflitam se `plantaoA.data === plantaoB.data` e os intervalos `[horarioInicio, horarioFim]` se sobrepõem. Exportar da `packages/shared/src/index.ts`. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/backend/src/repositories/plantaoRepository.ts` | Adicionar método `listByMedicoId(medicoId: string): Promise<Plantao[]>` — retorna todos os plantões onde o médico está inscrito. Mock: filtrar `mockPlantoes` pelo campo `inscricoes`. DynamoDB: query com GSI por `inscricoes`. |
| `apps/web/app/api/plantoes/[id]/inscricao/route.ts` | Após validar vagas, chamar `plantaoRepository.listByMedicoId(userId)`, iterar com `detectScheduleConflict(plantaoAlvo, plantaoExistente)`. Se conflito: retornar `409 { error: 'Conflito de horário', conflitoCom: plantaoExistente }`. |
| `apps/web/app/plantoes/[id]/page.tsx` | Antes do submit de inscrição, chamar `GET /api/plantoes?medicoId={userId}` para verificar conflitos localmente e exibir `Alert` de aviso (não bloqueante — servidor também valida). |

---

#### Notas de implementação

- A validação server-side é a fonte da verdade. O aviso no frontend é UX apenas.
- No mock mode, `listByMedicoId` pode filtrar o array `mockPlantoes` por `inscricoes.includes(medicoId)`.

---

### 4. Conformidade LGPD

**Descrição:** Implementar as 4 obrigações pendentes no PRD §4.4: (1) opt-in explícito de canais de notificação no cadastro; (2) política de privacidade; (3) direito ao esquecimento (exclusão de conta); (4) base legal documentada.

**Dependências:** Fluxo de cadastro existente. Repositório de usuários existente.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `apps/web/app/privacidade/page.tsx` | Página estática com Política de Privacidade: base legal (legítimo interesse + contrato), dados coletados (CPF, CRM, telefone, e-mail), finalidade, canais de notificação, retenção (2 anos), direitos do titular, contato do DPO. |
| `apps/web/app/api/auth/delete-account/route.ts` | `DELETE`: requireAuth. Apagar dados pessoais do usuário (anonimizar ou deletar da tabela `plantao_users`): nome → "Usuário Removido", email → null, telefone → null, crm → null, cpf → null. Cancelar inscrições ativas. Retornar 200. Guard: `requireAuth`. |
| `apps/web/components/auth/ConsentCheckboxes.tsx` | Componente com 3 checkboxes controlados: "Aceito receber notificações por e-mail", "Aceito receber notificações por SMS", "Aceito receber notificações push". Props: `value: ConsentPreferences`, `onChange`. Checkbox de política (obrigatório): "Li e aceito a Política de Privacidade". |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/shared/src/types/user.ts` | Adicionar campos opcionais ao tipo `User`: `emailOptIn?: boolean`, `smsOptIn?: boolean`, `pushOptIn?: boolean`, `privacyAcceptedAt?: string`. |
| `apps/web/app/signup/page.tsx` | Incluir `<ConsentCheckboxes>` no formulário. Campo "política" obrigatório para submissão. Enviar preferências no body do registro. |
| `apps/web/app/api/auth/register/route.ts` | Persistir campos `emailOptIn`, `smsOptIn`, `pushOptIn`, `privacyAcceptedAt` no usuário criado. |
| `packages/backend/src/repositories/authRepository.ts` | Incluir novos campos na criação/update de usuário (mock + DynamoDB). Adicionar método `deleteUserData(userId)` para anonimização. |
| `apps/web/app/layout.tsx` | Adicionar link "Política de Privacidade" no rodapé do layout raiz. |

---

#### Notas de implementação

- A anonimização é preferível à deleção para preservar integridade referencial (plantões, logs).
- `privacyAcceptedAt` deve ser ISO string salva no momento do registro.
- No orchestrator, respeitar `smsOptIn`, `emailOptIn`, `pushOptIn` ao montar `NotificationRecipient`.

---

## MÉDIA PRIORIDADE

---

### 5. Documentos no app mobile

**Descrição:** Adicionar aba "Documentos" no app Expo. Médicos podem listar documentos dos seus plantões e visualizar PDFs (usando `expo-web-browser` ou `react-native-pdf`). A aba de Notificações (atualmente stub) também deve ser implementada.

**Dependências:** API de documentos existente no backend. `apps/mobile/lib/api/client.ts` existente.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `apps/mobile/lib/api/documentos.ts` | Funções: `fetchDocumentosByPlantao(plantaoId)`, `markDocumentoAsViewed(docId)`. Usar o `client` Axios existente. |
| `apps/mobile/app/(tabs)/documentos.tsx` | Tela de listagem de documentos. `FlatList` com `DocumentItem`. Buscar documentos dos plantões onde o médico está inscrito. Ao tocar: abrir PDF via `Linking.openURL(downloadUrl)` ou `expo-web-browser`. |
| `apps/mobile/components/DocumentItem.tsx` | Card do documento: título, nome do plantão, data de upload, badge "não lido". Props: `documento: PlantaoDocumentoComLeitura`, `onPress`. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `apps/mobile/app/(tabs)/_layout.tsx` | Adicionar tab "Documentos" com ícone `file-text` (Ionicons). Posicionar entre "Plantões" e "Notificações". |
| `apps/mobile/app/(tabs)/notifications.tsx` | Implementar lista real de notificações: `FlatList` consumindo `GET /api/notificacoes/documentos` (adaptar para mobile). Exibir data, tipo, status lido/não lido. Substituir o stub atual. |

---

#### Notas de implementação

- PDF no mobile: `Linking.openURL(url)` abre o PDF no browser nativo sem dependências extras.
- Respeitar o padrão de `FlatList` + `RefreshControl` já usado em `(tabs)/index.tsx`.
- Não é necessário rastrear leitura no mobile na primeira versão (simplificação).

---

### 6. Arquivamento de documentos

**Descrição:** Admin e coordenador podem arquivar documentos (status `'arquivado'`). Documentos arquivados ficam ocultos por padrão na listagem mas podem ser visualizados com filtro.

**Dependências:** `documentRepository` existente. `DocumentCard` e `DocumentList` existentes.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `apps/web/app/api/documentos/[id]/arquivar/route.ts` | `PATCH`: requireCoordinator. Chama `documentRepository.archiveDocument(id)`. Retorna documento atualizado. |
| `apps/web/hooks/useArquivarDocumento.ts` | `useMutation` TanStack Query: `PATCH /api/documentos/{id}/arquivar`. Em `onSuccess`: invalidate `['documentos', 'plantao', plantaoId]`. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/backend/src/repositories/documentRepository.ts` | Adicionar método `archiveDocument(id: string): Promise<PlantaoDocumento>` — atualiza `status → 'arquivado'` (mock: Map update; DynamoDB: UpdateItem). Modificar `listByPlantaoId` para aceitar parâmetro `includeArchived?: boolean` (default `false`). |
| `apps/web/components/documentos/DocumentCard.tsx` | Adicionar botão "Arquivar" (ícone `Archive`) visível apenas para `admin` e `coordenador`. Ao clicar, chamar `useArquivarDocumento`. Exibir badge "Arquivado" em documentos com `status === 'arquivado'`. |
| `apps/web/components/documentos/DocumentList.tsx` | Adicionar toggle "Mostrar arquivados" (padrão: oculto). Passar `includeArchived` como parâmetro para o hook de busca. |

---

### 7. Dashboard analytics para admin

**Descrição:** Painel com métricas operacionais para o admin: cobertura de plantões (% com inscrições), total de plantões no mês, documentos não lidos, usuários pendentes de aprovação.

**Dependências:** Repositórios existentes. Navbar existente.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `apps/web/app/dashboard/page.tsx` | Página `/dashboard` (requireAdmin). Grid de `StatsCard` + `CoverageChart`. Usar `useAdminAnalytics`. |
| `apps/web/app/api/admin/analytics/route.ts` | `GET` requireAdmin. Agregar: total plantões (mês atual), plantões com ≥1 inscrição, % cobertura, total usuários pendentes, total documentos não lidos (todos os usuários). Reutilizar repositórios existentes. |
| `apps/web/components/dashboard/StatsCard.tsx` | Card simples: label, valor, variação (ex: "+3 esta semana"). Props: `{ label, value, delta?, icon }`. |
| `apps/web/components/dashboard/CoverageChart.tsx` | Gráfico de barras simples (CSS puro ou `recharts` se já instalado): cobertura por especialidade. Props: `{ data: { especialidade, total, cobertos }[] }`. |
| `apps/web/hooks/useAdminAnalytics.ts` | `useQuery(['admin', 'analytics'], ..., { staleTime: 60_000 })`. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `apps/web/components/layout/Navbar.tsx` | Adicionar link "Dashboard" visível apenas para `role === 'admin'`. |

---

### 8. Plantões recorrentes

**Descrição:** Na criação de plantão, o coordenador pode marcar como recorrente e definir uma regra (semanal ou mensal por N semanas/meses). O sistema cria múltiplos plantões com os mesmos dados, vinculados por `recurrenceId`.

**Dependências:** Criação de plantão existente. `plantaoRepository` existente.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `packages/shared/src/types/recurrence.ts` | Tipo `RecurrenceRule { frequency: 'semanal' \| 'mensal', occurrences: number }`. Exportar em `packages/shared/src/index.ts`. |
| `apps/web/components/plantoes/RecurrenceForm.tsx` | Subformulário: toggle "Plantão recorrente", select frequência, input "Repetições" (1–52). Props: `value: RecurrenceRule \| null`, `onChange`. |
| `apps/web/app/api/plantoes/recorrentes/route.ts` | `POST` requireCoordinator. Body: plantão base + `recurrenceRule`. Gera array de datas, chama `plantaoRepository.createBatch(plantoes)`. Retorna array de plantões criados. Dispara notificações para cada plantão criado. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/shared/src/types/plantao.ts` | Adicionar campos opcionais: `recurrenceId?: string`, `recurrenceRule?: RecurrenceRule`. |
| `apps/web/app/criar/page.tsx` | Adicionar `<RecurrenceForm>` abaixo dos campos de horário. Se recorrente: submeter para `/api/plantoes/recorrentes` ao invés de `/api/plantoes`. |
| `packages/backend/src/repositories/plantaoRepository.ts` | Adicionar método `createBatch(plantoes: Omit<Plantao, 'id'>[])`: cria N plantões com mesmo `recurrenceId` (uuid gerado uma vez). Mock: push em array. DynamoDB: `BatchWriteItem`. |

---

### 9. Busca e filtros de documentos

**Descrição:** Na listagem de documentos de um plantão, permitir busca por título e filtros por data de upload (intervalo).

**Dependências:** `DocumentList` existente. `useDocumentosByPlantao` existente. Rota `GET /api/plantoes/[id]/documentos` existente.

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `apps/web/app/api/plantoes/[id]/documentos/route.ts` | Aceitar query params: `?q=` (busca por título, case-insensitive), `?desde=` (ISO date), `?ate=` (ISO date). Passar para repositório. |
| `packages/backend/src/repositories/documentRepository.ts` | Modificar `listByPlantaoId` para aceitar `filters?: { q?: string, desde?: string, ate?: string }`. Mock: filtrar array. DynamoDB: filter expression no scan/query. |
| `apps/web/hooks/useDocumentosByPlantao.ts` | Aceitar parâmetro `filters` e incluí-lo na query key e nos params da requisição. |
| `apps/web/components/documentos/DocumentList.tsx` | Adicionar barra de busca (input texto) e date pickers "De / Até". Usar state local, debounce 300ms no input de texto, passar para o hook. |

---

## BAIXA PRIORIDADE

---

### 10. Export de escala (PDF/CSV)

**Descrição:** Na página de gerenciamento e no calendário, botão para exportar a escala do mês em PDF ou CSV.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `apps/web/app/api/plantoes/export/route.ts` | `GET` requireCoordinator. Query params: `?format=pdf\|csv&mes=1-12&ano=2026`. CSV: montar com cabeçalho e linhas (usar template string). PDF: gerar HTML e retornar como `text/html` com print CSS, ou usar biblioteca leve como `jspdf`. Retornar blob com `Content-Disposition: attachment`. |
| `apps/web/components/plantoes/ExportButton.tsx` | Botão com dropdown "Exportar CSV" / "Exportar PDF". Ao clicar: `window.open('/api/plantoes/export?format=...&mes=...&ano=...')`. Props: `{ mes: number, ano: number }`. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `apps/web/app/gerenciar/page.tsx` | Adicionar `<ExportButton>` no cabeçalho da página. |
| `apps/web/app/calendario/page.tsx` | Adicionar `<ExportButton>` passando o mês/ano atualmente visível no calendário. |

---

### 11. Múltiplos arquivos por upload

**Descrição:** O modal de upload aceita múltiplos PDFs de uma vez. Cada arquivo gera um documento separado.

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `apps/web/components/documentos/DocumentUploadModal.tsx` | Adicionar atributo `multiple` no `<input type="file">`. Exibir lista de arquivos selecionados com campo de título individual por arquivo. Loop de uploads sequenciais com indicador de progresso por arquivo. |
| `apps/web/app/api/plantoes/[id]/documentos/route.ts` | Suportar múltiplas entradas `arquivo` no `formData`. Iterar e processar cada uma, coletando erros por arquivo sem cancelar os demais. Retornar `{ documentos: PlantaoDocumento[], erros: { fileName, error }[] }`. |
| `packages/backend/src/repositories/documentRepository.ts` | Adicionar método `createDocumentBatch(docs: Omit<PlantaoDocumento, 'id'>[])` para inserção eficiente. Mock: map + push. DynamoDB: `BatchWriteItem`. |

---

### 12. Versioning de documentos

**Descrição:** Coordenador pode substituir um documento existente fazendo upload de uma nova versão. O histórico de versões é preservado.

---

#### Arquivos a CRIAR

| Arquivo | O que criar |
|---|---|
| `apps/web/app/api/documentos/[id]/versao/route.ts` | `POST` requireCoordinator. Recebe `multipart/form-data` com `arquivo`. Marca versão anterior como `status: 'versao_anterior'`. Cria novo documento com `parentId = id` e `version = anterior.version + 1`. |
| `apps/web/components/documentos/DocumentVersionHistory.tsx` | Dialog/drawer exibindo lista de versões do documento: data de upload, uploader, botão de download por versão. Props: `{ documentoId }`. |

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/shared/src/types/plantaoDocumento.ts` | Adicionar `parentId?: string`, `version?: number` (padrão: 1). Adicionar `'versao_anterior'` ao union de `status`. |
| `packages/backend/src/repositories/documentRepository.ts` | Adicionar método `createVersion(parentId, novoDoc)`: busca versão atual, atualiza `status → 'versao_anterior'`, cria novo com `parentId` e `version` incrementado. Adicionar `listVersionsByParentId(parentId)` para histórico. |
| `apps/web/components/documentos/DocumentCard.tsx` | Adicionar botão "Nova Versão" (ícone `GitBranch`) para admin/coord. Botão "Ver histórico" abre `DocumentVersionHistory`. |

---

### 13. Audit log de documentos

**Descrição:** Registrar na tabela de logs existente eventos de upload e visualização de documentos.

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/backend/src/repositories/` | Criar `logRepository.ts` (se não existir) ou estender com método `createLogEntry({ userId, action, entityType, entityId, details })`. Mock: push em array. DynamoDB: PutItem na tabela de logs existente. |
| `apps/web/app/api/plantoes/[id]/documentos/route.ts` | Após upload bem-sucedido, chamar `logRepository.createLogEntry({ userId, action: 'DOCUMENTO_UPLOAD', entityType: 'DOCUMENT', entityId: doc.id, details: { titulo, plantaoId } })`. |
| `apps/web/app/api/documentos/[id]/visualizado/route.ts` | Após marcar como lido, chamar `logRepository.createLogEntry({ ..., action: 'DOCUMENTO_VISUALIZADO' })`. |

---

### 14. CloudFront à frente do S3

**Descrição:** Colocar uma distribuição CloudFront na frente do bucket S3 para melhorar latência de carregamento de PDFs em regiões distantes do `us-east-1`.

---

#### Arquivos a MODIFICAR

| Arquivo | O que modificar |
|---|---|
| `packages/backend/src/aws/s3/documentStorage.ts` | Na função `getPresignedDownloadUrl`: se `process.env.AWS_CLOUDFRONT_DOMAIN` estiver definido, substituir o host da URL gerada pelo domínio CloudFront. Manter geração normal como fallback. |
| `apps/web/.env.example` | Adicionar: `AWS_CLOUDFRONT_DOMAIN=` (vazio por padrão, ativar em produção). |

---

#### Setup necessário (infraestrutura)

```bash
# Criar distribuição CloudFront apontando para o bucket S3
# Origin: plantao-facil-documentos.s3.amazonaws.com
# Configurar OAC (Origin Access Control) para acesso privado
# Adicionar domínio CF gerado em AWS_CLOUDFRONT_DOMAIN
```

---

## Convenções e Padrões a Seguir

| Padrão | Referência |
|---|---|
| Repository (mock + DynamoDB) | `packages/backend/src/repositories/plantaoRepository.ts` |
| TanStack Query hook | `apps/web/hooks/useDocumentosByPlantao.ts` |
| Zustand store | `apps/web/stores/documentNotificationStore.ts` |
| Feature flag | `ENABLE_EMAIL_NOTIFICATIONS` em `awsSesService.ts` |
| Route guard | `requireAuth`, `requireCoordinator`, `requireAdmin` de `@plantao/backend` |
| Notificação fire-and-forget | `apps/web/app/api/plantoes/[id]/inscricao/route.ts` |
| React Email template | `packages/notifications/src/templates/PlantaoCriadoEmail.tsx` |
