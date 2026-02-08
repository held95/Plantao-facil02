# 🚀 Quick Start - Deploy em 5 Minutos

## Pré-requisitos
- ✅ Conta no GitHub (https://github.com/signup)
- ✅ Conta na Vercel (https://vercel.com/signup - use GitHub)

---

## 📤 Passo 1: GitHub (2 minutos)

### 1.1. Criar Repositório
1. Acesse: https://github.com/new
2. Nome do repositório: `plantao-facil-app`
3. Deixe como **Private**
4. **NÃO marque** nenhuma opção (README, .gitignore, licença)
5. Clique **"Create repository"**

### 1.2. Fazer Push do Código

**Opção A: Script Automático (Recomendado)**

1. Abra o arquivo: `push-to-github.bat` com um editor de texto
2. Na **linha 9**, substitua:
   ```batch
   set GITHUB_USERNAME=seu-username-aqui
   ```
   Exemplo: se seu username é "joaosilva", fica:
   ```batch
   set GITHUB_USERNAME=joaosilva
   ```
3. Salve o arquivo
4. Dê duplo-clique em `push-to-github.bat`
5. ✅ Pronto! Código enviado para GitHub

**Opção B: Comandos Manuais**

```bash
cd c:\Users\helde\Downloads\aws_project\plantao-facil-app

# Substitua SEU-USUARIO pelo seu username
git remote add origin https://github.com/SEU-USUARIO/plantao-facil-app.git
git branch -M main
git push -u origin main
```

---

## 🌐 Passo 2: Vercel Deploy (3 minutos)

### 2.1. Importar Projeto

1. Acesse: https://vercel.com/new
2. Faça login com **GitHub**
3. Clique em **"Import Git Repository"**
4. Encontre: `plantao-facil-app`
5. Clique **"Import"**

### 2.2. Configurar Environment Variables

**IMPORTANTE:** Adicione sua variável de ambiente:

1. Na tela de configuração, expanda **"Environment Variables"**
2. Adicione:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://sua-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod`
   - **Environment**: Marque todos (Production, Preview, Development)
3. Clique **"Add"**

### 2.3. Deploy

1. Clique **"Deploy"**
2. Aguarde ~2 minutos (primeira vez demora mais)
3. ✅ Pronto! Você verá: **"Congratulations!"**
4. Clique em **"Visit"** para ver seu site no ar

---

## 🎉 Seu Site Está No Ar!

Você receberá uma URL como:
```
https://plantao-facil-app-xxx.vercel.app
```

### Compartilhe:
- **Dashboard**: https://seu-projeto.vercel.app
- **Documentos**: https://seu-projeto.vercel.app/documents
- **GitHub**: https://github.com/seu-usuario/plantao-facil-app

---

## ⚙️ Configuração Extra: CORS na AWS

Para que o site funcione com a API, configure CORS no API Gateway:

1. **AWS Console** → **API Gateway**
2. Selecione sua API
3. **CORS** → **Configure**
4. Adicione:
   - **Access-Control-Allow-Origin**: `https://seu-projeto.vercel.app`
   - **Access-Control-Allow-Methods**: `GET, POST, OPTIONS`
   - **Access-Control-Allow-Headers**: `Content-Type`
5. **Save** → **Deploy API**

---

## 🔄 Atualizações Automáticas

Agora, toda vez que você fizer:
```bash
git add .
git commit -m "Sua mensagem"
git push
```

A Vercel vai:
1. ✅ Detectar o push
2. ✅ Fazer build automaticamente
3. ✅ Fazer deploy automaticamente
4. ✅ Notificar você por email

---

## 📊 Monitoramento

### Vercel Dashboard
- **Analytics**: Ver visitas e performance
- **Logs**: Ver erros e requests
- **Deployments**: Histórico de deploys

### URLs Úteis:
- Dashboard Vercel: https://vercel.com/dashboard
- Seu Projeto: https://vercel.com/seu-usuario/plantao-facil-app
- GitHub Repo: https://github.com/seu-usuario/plantao-facil-app

---

## ❓ Troubleshooting

### Erro ao fazer push
**Problema**: Git pede autenticação
**Solução**: Use GitHub Desktop ou configure Git Credential Manager

### Site não carrega API
**Problema**: CORS ou variável não configurada
**Solução**:
1. Verifique `NEXT_PUBLIC_API_BASE_URL` na Vercel
2. Configure CORS no API Gateway (veja acima)

### Deploy falhou
**Problema**: Build error
**Solução**: Veja logs na Vercel → Deployments → [seu deploy] → Building

---

## 🎓 Próximos Passos

Agora que está no ar, você pode:

1. **Testar**: Acesse `/documents` e verifique se lista documentos
2. **Customizar**: Edite cores, textos no código
3. **Adicionar Features**: Implement Phase 2 (busca e filtros)
4. **Domínio Customizado**: Configure seu próprio domínio na Vercel

---

**✅ Parabéns! Seu projeto está no ar!** 🚀
