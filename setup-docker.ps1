#!/usr/bin/env pwsh

Write-Host "🚀 INICIANDO SETUP TELEVIP..." -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado! Instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down --remove-orphans 2>$null

# Verificar se arquivos existem
Write-Host "📁 Verificando arquivos..." -ForegroundColor Yellow

if (!(Test-Path "docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml não encontrado!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "api/package.json")) {
    Write-Host "❌ API não configurada corretamente!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivos encontrados" -ForegroundColor Green

# Criar .env se não existir
if (!(Test-Path "api/.env")) {
    Write-Host "⚙️ Criando api/.env..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://televip_user:SuaSenhaSegura123!@db:5432/televip"
JWT_SECRET=televip_secret_key_2025
PORT=4000
BOT_TOKEN=SEU_BOT_TOKEN_AQUI
STRIPE_SECRET_KEY=sk_test_SEU_STRIPE_KEY_AQUI
"@ | Out-File -FilePath "api/.env" -Encoding UTF8
}

if (!(Test-Path "bot/.env")) {
    Write-Host "⚙️ Criando bot/.env..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://televip_user:SuaSenhaSegura123!@db:5432/televip"
BOT_TOKEN=SEU_BOT_TOKEN_AQUI
BOT_USERNAME=seu_bot_username
STRIPE_SECRET_KEY=sk_test_SEU_STRIPE_KEY_AQUI
"@ | Out-File -FilePath "bot/.env" -Encoding UTF8
}

if (!(Test-Path "web/.env")) {
    Write-Host "⚙️ Criando web/.env..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:4000/api
"@ | Out-File -FilePath "web/.env" -Encoding UTF8
}

# Subir banco de dados primeiro
Write-Host "🐘 Iniciando PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d db

Write-Host "⏳ Aguardando banco inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar se banco subiu
$dbStatus = docker ps --filter "name=televip-db" --format "table {{.Status}}"
if ($dbStatus -like "*Up*") {
    Write-Host "✅ PostgreSQL iniciado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao iniciar PostgreSQL" -ForegroundColor Red
    docker logs televip-db
    exit 1
}

# Subir API
Write-Host "⚙️ Iniciando API..." -ForegroundColor Yellow
docker-compose up -d api

Write-Host "⏳ Aguardando API inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Verificar API
$apiStatus = docker ps --filter "name=televip-api" --format "table {{.Status}}"
if ($apiStatus -like "*Up*") {
    Write-Host "✅ API iniciada com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao iniciar API" -ForegroundColor Red
    Write-Host "📋 Logs da API:" -ForegroundColor Yellow
    docker logs televip-api
}

# Subir Bot
Write-Host "🤖 Iniciando Bot..." -ForegroundColor Yellow
docker-compose up -d bot

Start-Sleep -Seconds 10

# Verificar Bot
$botStatus = docker ps --filter "name=televip-bot" --format "table {{.Status}}"
if ($botStatus -like "*Up*") {
    Write-Host "✅ Bot iniciado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao iniciar Bot" -ForegroundColor Red
    Write-Host "📋 Logs do Bot:" -ForegroundColor Yellow
    docker logs televip-bot
}

# Subir Web
Write-Host "🌐 Iniciando aplicação Web..." -ForegroundColor Yellow
docker-compose up -d web

Write-Host "⏳ Aguardando Web compilar..." -ForegroundColor Yellow
Start-Sleep -Seconds 25

# Status final
Write-Host "`n📊 STATUS FINAL DOS CONTAINERS:" -ForegroundColor Green
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n🎉 SETUP CONCLUÍDO!" -ForegroundColor Green
Write-Host "🌐 Aplicação Web: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⚙️ API: http://localhost:4000/health" -ForegroundColor Cyan
Write-Host "📊 Admin padrão: mauro_lcf@example.com / admin123" -ForegroundColor Cyan

Write-Host "`n⚠️ IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Configure seus tokens reais nos arquivos .env" -ForegroundColor White
Write-Host "2. BOT_TOKEN no bot/.env e api/.env" -ForegroundColor White
Write-Host "3. STRIPE_SECRET_KEY nos mesmos arquivos" -ForegroundColor White

Write-Host "`n🔍 Para ver logs:" -ForegroundColor Yellow
Write-Host "docker logs televip-api" -ForegroundColor White
Write-Host "docker logs televip-bot" -ForegroundColor White
Write-Host "docker logs televip-web" -ForegroundColor White