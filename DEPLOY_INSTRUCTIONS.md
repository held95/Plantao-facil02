# 🚀 Instruções de Deploy - Plantão Fácil

## Parte 1: GitHub

### Comandos para Push (Execute após criar o repositório)

```bash
cd c:\Users\helde\Downloads\aws_project\plantao-facil-app

# Adicione o remote (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/plantao-facil-app.git

# Renomeie a branch para main (padrão do GitHub)
git branch -M main

# Faça o push
git push -u origin main
```

**Importante:** Substitua `SEU-USUARIO` pelo seu username do GitHub antes de executar!

---

## Parte 2: Vercel Deploy

### Opção A: Via Website (Recomendado - Mais Fácil)

1. Acesse: https://vercel.com/login
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Na lista de repositórios, encontre **plantao-facil-app**
5. Clique em **"Import"**
6. Configure o projeto:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `./` (deixe como está)
   - **Build Command**: `npm run build` (já configurado)
   - **Output Directory**: `.next` (já configurado)

7. **Adicione as Environment Variables:**
   - Clique em **"Environment Variables"**
   - Adicione:
     ```
     Name: NEXT_PUBLIC_API_BASE_URL
     Value: sua-url-do-api-gateway-aqui
     ```

8. Clique em **"Deploy"**
9. Aguarde ~2 minutos
10. ✅ Pronto! Você receberá uma URL como: `https://plantao-facil-app.vercel.app`

### Opção B: Via CLI do Vercel

```bash
# Instalar Vercel CLI (global)
npm install -g vercel

# Login
vercel login

# Deploy (na pasta do projeto)
cd c:\Users\helde\Downloads\aws_project\plantao-facil-app
vercel

# Siga as instruções no terminal:
# - Set up and deploy? Yes
# - Which scope? Escolha seu account
# - Link to existing project? No
# - What's your project's name? plantao-facil-app
# - In which directory is your code located? ./
# - Override settings? No

# Deploy para produção
vercel --prod
```

---

## Configuração Pós-Deploy

### 1. Configurar Domínio Customizado (Opcional)

No dashboard da Vercel:
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio customizado
3. Configure os DNS conforme instruções

### 2. Configurar CORS na API Gateway

No AWS Console:
1. Vá para **API Gateway**
2. Selecione sua API
3. Em **CORS**, adicione:
   - **Allowed Origins**: `https://plantao-facil-app.vercel.app` (sua URL do Vercel)
   - **Allowed Methods**: GET, POST, OPTIONS
   - **Allowed Headers**: Content-Type, Authorization

4. **Deploy API** para aplicar mudanças

### 3. Atualizar Environment Variables na Vercel

Se precisar atualizar variáveis:
1. Dashboard Vercel → Seu projeto
2. **Settings** → **Environment Variables**
3. Adicione/Edite variáveis
4. **Redeploy** o projeto (Settings → Deployments → Redeploy)

---

## Verificação de Deploy

### Checklist de Testes:

- [ ] Home page carrega: `https://seu-projeto.vercel.app`
- [ ] Navbar aparece e links funcionam
- [ ] `/documents` carrega (pode mostrar erro de API se não configurado)
- [ ] `/documents/123` mostra página de detalhe (pode mostrar erro 404)
- [ ] Build logs não mostram erros críticos
- [ ] Performance Lighthouse > 90

---

## Troubleshooting

### Erro: "API endpoint not configured"
**Solução**: Configure `NEXT_PUBLIC_API_BASE_URL` nas Environment Variables da Vercel

### Erro: "CORS policy blocked"
**Solução**: Adicione a URL do Vercel nas configurações CORS do API Gateway

### Erro: "Build failed"
**Solução**: Verifique os logs de build na Vercel. Normalmente é falta de variável de ambiente.

### Deploy muito lento
**Solução**: Normal na primeira vez. Deploys subsequentes são mais rápidos (~30s).

---

## Continuous Deployment (Automático)

Após configurar, todo `git push` para `main` vai:
1. ✅ Trigger automático de build na Vercel
2. ✅ Deploy automático se build passar
3. ✅ Notificação no GitHub (commit status check)

Para desabilitar: Settings → Git → Production Branch (desmarque)

---

## URLs Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentação Vercel + Next.js**: https://vercel.com/docs/frameworks/nextjs
- **GitHub Repository**: https://github.com/SEU-USUARIO/plantao-facil-app

---

## Comandos Git Úteis

```bash
# Ver status
git status

# Ver commits
git log --oneline

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Merge de branch
git checkout main
git merge feature/nova-funcionalidade

# Push de branch
git push origin feature/nova-funcionalidade

# Pull de mudanças
git pull origin main
```

---

**✨ Deploy completo! Seu projeto está no ar!**
