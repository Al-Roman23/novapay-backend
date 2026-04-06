# NovaPay 2.0 - Automated Onboarding Script (Windows)
# 🛡️ Setting Up The Transaction Backend Refinery For Mission Verification

Write-Host "🛡️ NovaPay Refinery: Initializing Mission Setup..." -ForegroundColor Cyan

# 1. Synchronizing Environment Templates To .env Files
Write-Host "🛡️ Step 1: Mapping Environment Templates..." -ForegroundColor Cyan
Get-ChildItem -Filter ".env.example" -Recurse | ForEach-Object {
    $target = $_.FullName.Replace(".env.example", ".env")
    if (-not (Test-Path $target)) {
        Copy-Item $_.FullName $target
        Write-Host "✅ Configured: $target" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Skipping: $target (Already Exists)" -ForegroundColor Yellow
    }
}

# 2. Installing Professional Dependencies (Monorepo Workspace)
Write-Host "🛡️ Step 2: Running Global NPM Install..." -ForegroundColor Cyan
npm install

# 3. Generating Secure Prisma Database Clients
Write-Host "🛡️ Step 3: Triggering Turbo Generator (Scaffolding)..." -ForegroundColor Cyan
npx turbo generate

Write-Host "🛡️ Step 4: Generating Database Clients (Prisma)..." -ForegroundColor Cyan
npx turbo run generate

Write-Host "💎 NovaPay Setup Complete! Every Hardening Feature Is Now In Sync." -ForegroundColor Green
Write-Host "🚀 Next Step: Run 'cd infra; docker-compose up --build' To Launch The Refinery." -ForegroundColor Cyan
