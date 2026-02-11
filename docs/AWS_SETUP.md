# Guia de Configuração AWS - Plantão Fácil

Este guia detalha como configurar **AWS SES** (email) e **AWS SNS** (SMS) para o sistema de notificações do Plantão Fácil.

---

## 📋 Pré-requisitos

- Conta AWS ativa ([criar conta gratuita](https://aws.amazon.com/free/))
- Acesso ao Console AWS
- Cartão de crédito válido (para ativar SNS SMS)
- Domínio próprio (recomendado para SES em produção)
- Node.js 18+ instalado

---

## 💰 Custos Estimados (Brasil)

### AWS SES (Email)
- **Primeiros 62.000 emails/mês**: GRÁTIS (quando enviado de EC2/Lambda)
- **Emails adicionais**: $0.10 USD por 1.000 emails
- **Exemplo**: 10.000 emails/mês = GRÁTIS

### AWS SNS (SMS)
- **Brasil**: ~$0.06 USD por SMS (~R$0.30)
- **Exemplo**: 1.000 SMS/mês = $60 USD (~R$300)
- ⚠️ **Importante**: Configure alertas de billing para evitar surpresas!

---

## 🔧 Parte 1: Configuração Inicial AWS

### 1.1 Criar Usuário IAM

1. **Acesse o Console AWS** → [IAM Dashboard](https://console.aws.amazon.com/iam/)

2. **No menu lateral**, clique em **"Users"** (Usuários)

3. **Clique em "Create user"** (Criar usuário)
   - Nome do usuário: `plantao-facil-ses-sns`
   - Marque: **"Provide user access to the AWS Management Console"** (opcional)

4. **Configure permissões**:
   - Selecione **"Attach policies directly"**
   - Busque e marque as políticas:
     - ✅ `AmazonSESFullAccess`
     - ✅ `AmazonSNSFullAccess`

5. **Revise e crie** o usuário

6. **Crie Access Keys**:
   - Entre no usuário criado
   - Vá em **"Security credentials"** → **"Access keys"**
   - Clique **"Create access key"**
   - Selecione: **"Application running outside AWS"**
   - **IMPORTANTE**: Salve o `Access Key ID` e `Secret Access Key` em local seguro
   - ⚠️ O Secret só é mostrado uma vez!

---

## 📧 Parte 2: Configuração AWS SES (Email)

### 2.1 Verificar Identidade (Email ou Domínio)

#### Opção A: Verificar Email Individual (Teste)

1. Acesse [AWS SES Console](https://console.aws.amazon.com/ses/)

2. No menu lateral: **"Verified identities"** → **"Create identity"**

3. Selecione: **"Email address"**

4. Digite seu email: `noreply@plantaofacil.com`

5. Clique **"Create identity"**

6. **Verifique seu email**: Você receberá um email da AWS com link de confirmação
   - Assunto: "Amazon SES Email Address Verification Request"
   - Clique no link para confirmar

7. Aguarde status mudar para **"Verified"** (verde)

#### Opção B: Verificar Domínio Completo (Produção - Recomendado)

1. No SES Console: **"Verified identities"** → **"Create identity"**

2. Selecione: **"Domain"**

3. Digite seu domínio: `plantaofacil.com`

4. Marque: **"Use a default MAIL FROM domain"**

5. **Configure DNS**:
   - AWS mostrará registros CNAME que você deve adicionar no seu provedor de DNS
   - Exemplo (valores serão diferentes):
     ```
     _amazonses.plantaofacil.com  CNAME  abc123.dkim.amazonses.com
     ```
   - Copie os registros e adicione em seu DNS (GoDaddy, Hostgator, etc.)

6. Aguarde propagação do DNS (15 min a 24 horas)

7. Status mudará para **"Verified"** quando DNS estiver correto

### 2.2 Sair do Sandbox (IMPORTANTE para Produção)

**Por padrão, AWS SES está em modo "Sandbox"**:
- ❌ Só pode enviar emails para endereços verificados
- ❌ Limite de 200 emails/dia
- ❌ 1 email/segundo

**Para enviar para qualquer email (produção)**:

1. No SES Console, clique em **"Account dashboard"**

2. Procure banner: **"Your account is in the Amazon SES sandbox"**

3. Clique **"Request production access"**

4. Preencha o formulário:
   - **Mail type**: Transactional
   - **Website URL**: `https://plantaofacil.com`
   - **Use case description** (em inglês):
     ```
     We are building a medical shift management system for doctors in Brazil.
     The system sends transactional emails to coordinators and doctors when:
     - A new shift is created (notification to coordinator)
     - A doctor registers for a shift (confirmation email)
     - Shift reminders (24h and 1h before)

     All emails are opt-in and users can unsubscribe at any time.
     We will implement bounce and complaint handling as per AWS best practices.
     Expected volume: 1,000-5,000 emails/month initially.
     ```
   - **Compliance**: Explique que segue LGPD e usuários podem se descadastrar

5. **Envie o pedido** e aguarde aprovação (geralmente 24-48 horas)

6. Você receberá email confirmando a aprovação

### 2.3 Testar Envio de Email

Após verificar identidade, teste via AWS CLI:

```bash
aws ses send-email \
  --from noreply@plantaofacil.com \
  --destination ToAddresses=seu-email@example.com \
  --message "Subject={Data='Teste SES'},Body={Text={Data='Email de teste do Plantão Fácil'}}" \
  --region us-east-1
```

✅ Se receber o email, SES está funcionando!

---

## 📱 Parte 3: Configuração AWS SNS (SMS)

### 3.1 Ativar SMS no SNS

1. Acesse [AWS SNS Console](https://console.aws.amazon.com/sns/)

2. No menu lateral: **"Text messaging (SMS)"** → **"Preferences"**

3. Configure as preferências de SMS:

   - **Default message type**: **Transactional**
     - Transactional = alta prioridade, mais caro
     - Promotional = baixa prioridade, mais barato

   - **Account spend limit**: $10.00 USD (ajuste conforme necessário)
     - ⚠️ Configure um limite baixo inicialmente para evitar gastos inesperados!

   - **Default sender ID**: `PlantaoFacil`
     - ⚠️ Sender ID não funciona no Brasil para todas as operadoras
     - Mensagem aparecerá como número curto ou "AWS"

4. Clique **"Save changes"**

### 3.2 Solicitar Aumento de Limite de Gastos (Opcional)

Por padrão, AWS limita gastos com SMS em $1-5 USD/mês para novas contas.

**Para aumentar o limite**:

1. Acesse [SNS → Text messaging (SMS)](https://console.aws.amazon.com/sns/home#/mobile/text-messaging)

2. Clique **"Request spending increase"**

3. Preencha o formulário:
   - **Service**: SNS SMS
   - **Limit type**: General Limits
   - **Region**: US East (N. Virginia) [ou sua região]
   - **New limit value**: $50 (ou valor desejado)
   - **Use case description** (em inglês):
     ```
     We need to send transactional SMS notifications for a medical shift management system in Brazil.
     SMS are sent to doctors and coordinators for:
     - Shift creation confirmations
     - Registration confirmations
     - Shift reminders

     All messages are opt-in and comply with Brazilian telecommunications regulations.
     Expected volume: 500-1,000 SMS/month initially.
     ```

4. Aguarde aprovação (geralmente 24-48 horas)

### 3.3 Testar Envio de SMS

Teste via AWS CLI (substitua pelo seu número real):

```bash
aws sns publish \
  --phone-number "+5511987654321" \
  --message "Teste de SMS do Plantão Fácil via AWS SNS" \
  --region us-east-1
```

✅ Se receber o SMS, SNS está funcionando!

⚠️ **Dica**: Teste primeiro com seu próprio número antes de enviar para usuários.

---

## 🔑 Parte 4: Configurar Variáveis de Ambiente

### 4.1 Copiar .env.example

```bash
cp .env.example .env.local
```

### 4.2 Preencher Credenciais AWS

Edite `.env.local` e adicione:

```env
# ============================================
# AWS CREDENTIALS (Shared by SES and SNS)
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE    # Substitua pelo seu
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY    # Substitua pelo seu

# ============================================
# EMAIL NOTIFICATIONS (AWS SES)
# ============================================
ENABLE_EMAIL_NOTIFICATIONS=true
AWS_SES_FROM_EMAIL=noreply@plantaofacil.com    # Email verificado no SES
AWS_SES_REPLY_TO=suporte@plantaofacil.com

# ============================================
# SMS NOTIFICATIONS (AWS SNS)
# ============================================
ENABLE_SMS_NOTIFICATIONS=true
```

⚠️ **IMPORTANTE**: Nunca commite `.env.local` no git!

### 4.3 Gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copie o resultado e adicione em `.env.local`:

```env
NEXTAUTH_SECRET=resultado_do_comando_acima
```

---

## ✅ Parte 5: Testar Integração

### 5.1 Instalar Dependências

```bash
npm install
```

### 5.2 Rodar Aplicação

```bash
npm run dev
```

### 5.3 Testar Criação de Plantão

1. Acesse http://localhost:3000

2. Faça login como coordenador:
   - Email: `helder@plantaofacil.com`
   - Senha: `senha123`

3. Vá em **"Criar Plantão"** e preencha o formulário

4. Clique **"Criar Plantão"**

5. **Verifique**:
   - ✅ Console do terminal deve mostrar:
     ```
     ✅ Email sent via AWS SES: <message-id>
     ✅ SMS sent via AWS SNS: <message-id>
     ```
   - ✅ Você deve receber um email
   - ✅ Você deve receber um SMS (se número estiver no cadastro)

### 5.4 Verificar Logs AWS

#### AWS SES (Email)
1. Acesse [SES → Sending Statistics](https://console.aws.amazon.com/ses/home#/account)
2. Verifique **"Sends"**, **"Bounces"**, **"Complaints"**

#### AWS SNS (SMS)
1. Acesse [SNS → Text messaging (SMS)](https://console.aws.amazon.com/sns/home#/mobile/text-messaging)
2. Clique em **"Publish text message"** (para ver histórico)
3. Ou use CloudWatch Logs para logs detalhados

---

## 🚨 Troubleshooting (Resolução de Problemas)

### Problema: "Email not sending" (Email não está enviando)

**Possíveis causas:**

1. **SES ainda em Sandbox**
   - ✅ Verifique no SES Console se saiu do sandbox
   - ✅ Se em sandbox, teste apenas com emails verificados

2. **Email não verificado**
   - ✅ Verifique se `AWS_SES_FROM_EMAIL` está verificado no SES
   - ✅ Status deve estar "Verified" (verde)

3. **Credenciais incorretas**
   - ✅ Verifique `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`
   - ✅ Teste credenciais com AWS CLI: `aws sts get-caller-identity`

4. **Região incorreta**
   - ✅ Verifique se `AWS_REGION` corresponde à região onde verificou o email
   - ✅ SES é region-specific! Se verificou em us-east-1, use us-east-1

**Como debugar:**

```bash
# No terminal onde rodou npm run dev, procure por:
❌ Failed to send email: <erro detalhado>
```

### Problema: "SMS not sending" (SMS não está enviando)

**Possíveis causas:**

1. **Limite de gastos atingido**
   - ✅ Verifique no SNS Console se atingiu o spending limit
   - ✅ Solicite aumento de limite

2. **Formato de telefone incorreto**
   - ✅ Número deve estar no formato E.164: `+5511987654321`
   - ✅ Não use: `(11) 98765-4321` ou `11987654321`

3. **Conta nova AWS**
   - ✅ Contas novas têm limite de $1-5/mês
   - ✅ Solicite aumento de limite via Support Center

4. **SMS não suportado no país**
   - ✅ Verifique se Brasil está na lista de países suportados
   - ✅ [Documentação de países suportados](https://docs.aws.amazon.com/sns/latest/dg/sns-supported-regions-countries.html)

**Como debugar:**

```bash
# No terminal, procure por:
❌ Failed to send SMS: <erro detalhado>
```

### Problema: "Credentials not configured" (Credenciais não configuradas)

**Solução:**

1. Verifique se `.env.local` existe (não `.env`)
2. Verifique se todas as variáveis AWS estão preenchidas:
   ```bash
   cat .env.local | grep AWS
   ```
3. Reinicie o servidor Next.js:
   ```bash
   # Pressione Ctrl+C
   npm run dev
   ```

### Problema: "Invalid phone number format" (Formato de telefone inválido)

**Solução:**

O sistema espera números brasileiros nos formatos:
- `(11) 98765-4321`
- `11987654321`
- `11 9 8765-4321`

Internamente, são convertidos para E.164: `+5511987654321`

Se o erro persistir, verifique o campo `telefone` no cadastro do usuário.

---

## 🔒 Segurança e Boas Práticas

### 1. Proteja suas Credenciais

- ❌ **NUNCA** commite `.env.local` no git
- ✅ `.env.local` já está no `.gitignore`
- ✅ Use AWS Secrets Manager em produção
- ✅ Ative 2FA na sua conta AWS

### 2. Configure Alertas de Billing

1. Acesse [AWS Billing Console](https://console.aws.amazon.com/billing/)
2. Vá em **"Billing preferences"** → **"Alert preferences"**
3. Marque: **"Receive Free Tier Usage Alerts"**
4. Marque: **"Receive Billing Alerts"**
5. Configure alerta para $10, $50, $100

### 3. Monitoramento

**Configurar CloudWatch Alarms:**

1. Acesse [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Crie alarmes para:
   - SES Bounces > 5%
   - SES Complaints > 0.1%
   - SNS SMS failures > 10

### 4. Rotação de Credenciais

**A cada 90 dias:**

1. Crie nova Access Key no IAM
2. Atualize `.env.local` com nova key
3. Teste aplicação
4. Delete Access Key antiga

### 5. Políticas IAM com Least Privilege

Em vez de `AmazonSESFullAccess`, use política customizada:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 📊 Monitoramento de Custos

### Dashboard Recomendado

1. Acesse [AWS Cost Explorer](https://console.aws.amazon.com/cost-management/home)

2. Configure relatório mensal:
   - **Group by**: Service
   - **Filter**: SNS, SES
   - **Chart type**: Bar

3. **Estimativa de custos mensais**:

| Usuários | Plantões/mês | Emails | SMS | Custo Email | Custo SMS | Total/mês |
|----------|--------------|--------|-----|-------------|-----------|-----------|
| 50       | 100          | 200    | 200 | GRÁTIS      | $12       | $12       |
| 200      | 500          | 1,000  | 1,000 | GRÁTIS    | $60       | $60       |
| 500      | 1,500        | 3,000  | 3,000 | GRÁTIS    | $180      | $180      |
| 1,000    | 3,000        | 6,000  | 6,000 | GRÁTIS    | $360      | $360      |

⚠️ **SMS é o principal custo!** Considere:
- Enviar apenas SMS críticos (confirmações)
- Usar email para lembretes não urgentes
- Permitir usuários optarem por SMS (opt-in)

---

## 🚀 Deploy em Produção

### Opções de Deploy

#### Opção 1: Vercel (Recomendado para Next.js)

1. **Conecte repositório GitHub** no [Vercel](https://vercel.com)

2. **Configure Environment Variables**:
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis do `.env.local`
   - ⚠️ Nunca exponha variáveis com `NEXT_PUBLIC_` se forem sensíveis

3. **Deploy**:
   ```bash
   git push origin main
   ```
   - Vercel faz deploy automático

4. **Atualize NEXTAUTH_URL**:
   ```env
   NEXTAUTH_URL=https://seu-app.vercel.app
   ```

#### Opção 2: AWS Amplify

1. Acesse [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Conecte repositório GitHub
3. Configure environment variables
4. Deploy automático a cada push

#### Opção 3: Docker + AWS ECS

```dockerfile
# Dockerfile já existe no projeto
docker build -t plantao-facil .
docker run -p 3000:3000 --env-file .env.local plantao-facil
```

### Checklist Pré-Deploy

- ✅ SES saiu do sandbox
- ✅ SNS spending limit configurado
- ✅ Todas env vars configuradas
- ✅ `.env.local` NÃO está no git
- ✅ Billing alerts configurados
- ✅ Domínio verificado no SES
- ✅ Testado envio de email e SMS
- ✅ 2FA ativado na conta AWS

---

## 📚 Recursos Adicionais

### Documentação AWS
- [AWS SES Developer Guide](https://docs.aws.amazon.com/ses/latest/dg/Welcome.html)
- [AWS SNS Developer Guide](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)

### Ferramentas Úteis
- [AWS CLI Installation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS Cost Calculator](https://calculator.aws/)
- [Mail Tester](https://www.mail-tester.com/) - Testar spam score de emails

### Suporte
- [AWS Support Center](https://console.aws.amazon.com/support/)
- [AWS Free Tier](https://aws.amazon.com/free/)

---

## 🆘 Suporte

### Precisa de Ajuda?

1. **Verifique o console do terminal**: Erros detalhados aparecem lá
2. **Consulte CloudWatch Logs**: Logs completos de SES e SNS
3. **Abra issue no GitHub**: [github.com/seu-usuario/plantao-facil02](https://github.com)

### Contato

- Email: suporte@plantaofacil.com
- Documentação: `/docs`

---

**✅ Configuração concluída!** Seu sistema de notificações AWS está pronto para uso.

**Próximos passos**:
1. Testar criação de plantão em desenvolvimento
2. Configurar billing alerts
3. Solicitar produção access no SES (se ainda não fez)
4. Fazer deploy em produção
5. Monitorar custos nas primeiras semanas

---

**Data de atualização**: 11 de fevereiro de 2025
**Versão do guia**: 1.0.0
