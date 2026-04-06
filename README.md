# NovaPay Transaction Backend Refinery 🛡️💎
> **Board Certification: COMPLIANT** | High-Hardened Financial Infrastructure

The NovaPay Backend Refinery Is A Mission-Critical Transaction Platform Designed To Handle Bulk Payroll And International Transfers With Absolute Integrity. Built To Resynchronize A Failed System, This Architecture Implements Rigorous Idempotency, Atomic Recovery, And Time-Locked FX Quotes To Eliminate Financial Drift.

---

## 🏰 Architectural Overview
The System Follows A **Cellular Microservice Architecture** With Strict Database Isolation (No Shared Databases).

```mermaid
graph TD
    User((User/HR Manager)) -->|HTTPS| Nginx[Nginx API Gateway]
    
    subgraph "Public Services"
        Nginx --> Account[Account Service]
        Nginx --> Transaction[Transaction Service]
        Nginx --> FX[FX Service]
    end
    
    subgraph "Operational Core"
        Nginx --> Payroll[Payroll Service]
        Nginx --> Admin[Admin Service]
    end
    
    subgraph "Financial Truth"
        Transaction -->|Atomic Call| Ledger[Ledger Service]
        Payroll -->|Queue| Redis[(BullMQ / Redis)]
        Redis -->|Process| Payroll
    end
    
    subgraph "Persistence Layer"
        Account --> DB1[(Account DB)]
        Transaction --> DB2[(Transaction DB)]
        FX --> DB3[(FX DB)]
        Ledger --> DB4[(Ledger DB)]
        Payroll --> DB5[(Payroll DB)]
    end
```

---

## 🚀 QuickStart & Setup (Mission Deliverable #1)
To Boot The Entire Refinery From Zero:

1. **Environment**: Run `./setup.sh` (or `setup.ps1` on Windows) To Initialize Variables.
2. **Infrastructure**: `cd infra && docker-compose up -d --build`.
3. **Database**: `npm install && npx turbo generate`.
4. **Verification**: `npm test` (Runs The Full Hardening Suite).

---

## 🛰️ API Endpoint Catalog (Mission Deliverable #2)
All Internal Traffic Flows Through The Nginx Gateway At `http://localhost:8088`.

### 🏢 1. Account Service (`/accounts`)
- **POST `/account`**
  - *Req*: `{"userId": "emp-001", "currency": "USD"}`
  - *Res*: `{"id": "acc-123", "userId": "emp-001", "wallets": [...]}`
- **GET `/:id`**
  - *Res*: `{"id": "acc-123", "userId": "emp-001"}`
- **POST `/:id/wallets`**
  - *Req*: `{"currency": "BDT"}`
  - *Res*: `{"id": "wallet-456", "currency": "BDT"}`

### 💱 2. FX Service (`/fx`)
- **POST `/quote`**
  - *Req*: `{"fromCurrency": "USD", "toCurrency": "BDT"}`
  - *Res*: `{"id": "quote-789", "rate": "123.00", "secondsRemaining": 60}`
- **GET `/quote/:id`**
  - *Res*: `{"id": "quote-789", "rate": "123.00", "isValid": true}`
- **POST `/quote/:id/use`**
  - *Res*: `{"status": "MARKED_USED"}`

### 💸 3. Transaction Service (`/transactions`)
- **POST `/transfers/international`**
  - *Req*: `{"idempotencyKey": "tx-1", "amount": 100, "quoteId": "quote-789"}`
  - *Res*: `{"id": "tx-001", "status": "COMPLETED"}`
- **GET `/history`**
  - *Res*: `[{"id": "tx-001", "amount": 100, "status": "COMPLETED"}]`

### 📑 📑 4. Payroll Service (`/payroll`)
- **POST `/`**
  - *Req*: `{"employerId": "hr-1", "items": [{"userId": "emp-1", "amount": 50}]}`
  - *Res*: `{"jobId": "pay-999", "status": "QUEUED"}`
- **GET `/:id`**
  - *Res*: `{"jobId": "pay-999", "processedItems": 45, "totalItems": 50}`

### 📒 5. Ledger Service (`/ledger`)
- **POST `/account`**
  - *Req*: `{"walletId": "w-1", "currency": "USD"}`
  - *Res*: `{"id": "led-acc-1", "balance": "0.00"}`
- **POST `/entry`**
  - *Req*: `{"fromWalletId": "w-1", "toWalletId": "w-2", "amount": 10}`
  - *Res*: `{"transactionId": "tx-001", "entries": [debit, credit]}`
- **GET `/invariant`**
  - *Res*: `{"status": "BALANCED", "drift": "0.00"}`

### 🛡️ 6. Admin Service (`/admin`)
- **GET `/health`**: `{"status": "HEALTHY", "services": 6}`
- **GET `/ledger-invariant`**: `{"status": "BALANCED"}`

---

## 🛡️ Hardening Logic (Mission Deliverables #3-7)

### 💎 1. Five-Scenario Idempotency Matrix
- **Scenario A (Exact Match)**: Returns existing record if `key` + `hash` match.
- **Scenario B (Race Condition)**: DB-level **UNIQUE Index** block simultaneous commits.
- **Scenario C (Atomic Recovery)**: Crash worker resumes `PROCESSING` states after 30s.
- **Scenario D (Key Expiry)**: Rejects keys older than 24h.
- **Scenario E (Payload Hijacking)**: Rejects if `key` matches but `amount` differs from initial.

### ⚖️ 2. Double-Entry Invariant & Verification
Every transaction maps to a **Debit** and **Credit** pair. We verify sanity via `Sum(LedgerEntries) === 0`. The `/ledger/invariant` endpoint runs absolute aggregation to detect drift.

### 💱 3. FX Quote Strategy
- **Expiry**: 60-second TTL enforced via Redis/DB timestamp checks.
- **Single-Use**: Quotes are flagged `used` upon first transaction.
- **Provider Failure**: System pauses quoting during outage to prevent stale-rate arbitrage.

### 📑 4. Payroll Resumability (Checkpoint Pattern)
Workers use a **Stateful Job Queue**. Each creditor is tracked individually. On restart, the worker queries `PayrollItem where status != 'COMPLETED'`, skipping already paid employees.

### ⛓️ 5. Audit Hash Chain & Tamper Detection
Entries are chained: `Hash_N = SHA256(Hash_N-1 + Details)`. Modifying a historical row invalidates the entire subsequent chain, alerting the **Integrity Monitor**.

---

## 🛠️ Tradeoffs & Roadmap (Mission Deliverables #8-9)

### Current Tradeoffs
- **Postgres Separation**: Prioritized microservice compliance over shared-database performance.
- **HTTP/1.1**: Used REST for simplicity; gRPC is better for production scale.

### Future Roadmap
- **Hardware Security (HSM)**: Secure storage for Master Keys.
- **Event Sourcing**: Rebuild ledger from raw events for absolute disaster recovery.
