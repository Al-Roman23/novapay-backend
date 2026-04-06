#!/bin/bash
# NovaPay 2.0 - Automated Onboarding Script
# 🛡️ Setting Up The Transaction Backend Refinery For Mission Verification

echo "🛡️ NovaPay Refinery: Initializing Mission Setup..."

# 1. Synchronizing Environment Templates To .env Files
echo "🛡️ Step 1: Mapping Environment Templates..."
find . -name ".env.example" | while read file; do
    target="${file%.example}"
    if [ ! -f "$target" ]; then
        cp "$file" "$target"
        echo "✅ Configured: $target"
    else
        echo "ℹ️ Skipping: $target (Already Exists)"
    fi
done

# 2. Installing Professional Dependencies (Monorepo Workspace)
echo "🛡️ Step 2: Running Global NPM Install..."
npm install

# 3. Generating Secure Prisma Database Clients
echo "🛡️ Step 3: Triggering Turbo Generator (Scaffolding)..."
npx turbo generate

echo "🛡️ Step 4: Generating Database Clients (Prisma)..."
npx turbo run generate

echo "💎 NovaPay Setup Complete! Every Hardening Feature Is Now In Sync."
echo "🚀 Next Step: Run 'cd infra && docker-compose up --build' To Launch The Refinery."
