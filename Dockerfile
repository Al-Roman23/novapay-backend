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

# Step 3: Architecture Note
# Prisma Client Generation Is Managed Dynamically At Runtime By Docker-Compose
# Via The 'prisma db push' Boot Script For Maximum Volume Synchronization.

# Note: The Specific Starting Command Is Defined In The docker-compose.yml File
# Each Service Runs Its Own 'npm run dev' Command From Its Subdirectory
