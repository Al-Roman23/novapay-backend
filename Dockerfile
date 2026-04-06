# Master Dockerfile For All Microservices Supporting NPM Workspaces
FROM node:22-alpine

# Set The Working Directory Inside The Container
WORKDIR /app

# Step 1: Copy The Entire Multi-Package Workspace Structure
# We Copy Everything First To Ensure Workspace Linking Works Correctly
COPY . .

# Step 2: Install All Dependencies Across All Workspaces
# This Correctly Links Local Packages Like @novapay/encryption
RUN npm install

# Step 3: Generate Prisma Client Artifacts For All Services
# This Ensures The Prisma Client Is Available To Each Service Locally
RUN npx prisma generate --schema=services/account-service/prisma/schema.prisma && \
    npx prisma generate --schema=services/ledger-service/prisma/schema.prisma && \
    npx prisma generate --schema=services/transaction-service/prisma/schema.prisma && \
    npx prisma generate --schema=services/fx-service/prisma/schema.prisma && \
    npx prisma generate --schema=services/payroll-service/prisma/schema.prisma

# Note: The Specific Starting Command Is Defined In The docker-compose.yml File
# Each Service Runs Its Own 'npm run dev' Command From Its Subdirectory
