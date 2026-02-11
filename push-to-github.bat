@echo off
echo ====================================
echo   Push para GitHub - Plantao Facil
echo ====================================
echo.

REM ====================================
REM EDITE ESTA LINHA COM SEU USERNAME:
REM ====================================
set GITHUB_USERNAME=SEU-USUARIO-AQUI
REM ====================================

echo Verificando se o username foi configurado...
if "%GITHUB_USERNAME%"=="SEU-USUARIO-AQUI" (
    echo.
    echo [ERRO] Voce precisa editar este arquivo primeiro!
    echo.
    echo Abra o arquivo: push-to-github.bat
    echo Linha 9: set GITHUB_USERNAME=SEU-USUARIO-AQUI
    echo Substitua SEU-USUARIO-AQUI pelo seu username do GitHub
    echo.
    pause
    exit /b 1
)

echo Username configurado: %GITHUB_USERNAME%
echo.
echo Adicionando remote do GitHub...
git remote add origin https://github.com/%GITHUB_USERNAME%/plantao-facil-app.git 2>nul
if %errorlevel% neq 0 (
    echo Remote ja existe, atualizando URL...
    git remote set-url origin https://github.com/%GITHUB_USERNAME%/plantao-facil-app.git
)

echo.
echo Renomeando branch para main...
git branch -M main

echo.
echo Fazendo push para GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo   SUCESSO! Codigo enviado para:
    echo   https://github.com/%GITHUB_USERNAME%/plantao-facil-app
    echo ====================================
    echo.
    echo Proximo passo: Deploy na Vercel
    echo Acesse: https://vercel.com/new
    echo.
) else (
    echo.
    echo [ERRO] Falha ao fazer push
    echo.
    echo Possíveis causas:
    echo 1. Repositorio nao foi criado no GitHub
    echo 2. Username incorreto
    echo 3. Precisa autenticar no GitHub
    echo.
    echo Para autenticar:
    echo 1. Windows vai pedir suas credenciais
    echo 2. Ou use: gh auth login
    echo.
)

pause
