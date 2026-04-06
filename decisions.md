# NovaPay Architectural Decisions & Integrity Matrix

This Document Formalizes The Technical Strategies Used To Harden The NovaPay Transaction Backend Against Financial Failure.

## 🛡️ Problem 1: Exactly-Once Idempotency Matrix
We Guarantee That Every Disbursement Is Processed Exactly Once, Even Under Extreme Network Failure Or Simultaneous Retries.

### Scenario A: Same Key Arrives Twice
- **Action**: Return Completed Record.
- **Handling**: The `TransactionRepository` First Scans For An Existing Record With The Same `idempotencyKey` And `requestHash`. If Found, The System Returns The Existing Object Immediately Without Initiating A New Lifecycle.

### Scenario B: Simultaneous Race Conditions (3 Requests in <100ms)
- **Action**: Exactly One Success, Two Fails.
- **Mechanism**: We Use Database-Level **UNIQUE Constraints** On The `idempotencyKey` Column. At The Database Layer, The First Request To Commit Grabs The Lock. The Subsequent Two Requests Will Trigger A `P2002` (Unique Constraint Violation) Exception, Which Is Mapped To A `409 Conflict` Response.

### Scenario C: Atomic Recovery (Crash Mid-Transaction)
- **Action**: Detect And Complete Or Reverse.
- **Mechanism**: Transactions Are Initialized With A `PENDING` Status. Once Processing Starts, They Transition To `PROCESSING`. A **Background Recovery Worker** Scans For Transactions Stuck In `PROCESSING` For >30s And Idempotently Resumes The Debit/Credit Flow.

### Scenario D: Time-Gated Key Expiry (24h Window)
- **Action**: Reject Stale Keys.
- **Handling**: Every Idempotency Key Has An `idempotencyExpiresAt` Timestamp (Current + 24h). If A Request Arrives After This Window, The System Rejects It To Prevent "Ghost Ship" Retries From Stale Client Systems.

### Scenario E: Payload Hijacking (Mismatched Amounts)
- **Action**: Protect Key Integrity.
- **Mechanism**: We Store A **SHA256 Request Hash** Of The Initial Payload. If A Client Retries With The Same Key But Changes The `amount` or `recipientId`, The Hash Mismatch Is Detected, And The Request Is Blocked With A Security Exception.

---

## 🏗️ Problem 2: Bulk Payroll & Resumability
For Bulk Payroll, We Decided On **Serial Processing (Concurrency: 1)** Per Employer Account.

### Why This Is Superior To Locking:
1. **Deadlock Prevention**: Concurrent Processing Of 14,000 Credits Against One Source Account Usually Causes Database Lock Contention And Deadlocks. 
2. **Deterministic Sequencing**: By Using BullMQ At `concurrency: 1`, We Guarantee A Linear Execution Order. 
3. **Checkpoint Pattern**: Each `PayrollItem` In The Job Has Its Own Status. If The Job Crashes, The Worker Resumes From The Last Unfinished Item, Skipping All Successful Creditors.

---

## 💱 Problem 3: Time-Locked FX Strategy
To Prevent Stale Rates, The `FXService` Issues **60-Second TTL Quotes**.

1. **Quote Request**: Client Receives A Signed Quote ID.
2. **Validation**: The `TransactionService` Validates That The Quote (a) Has Not Expired And (b) Has Not Been Used Before (`used` flag Check).
3. **Persistance**: The Exact Locked Rate Is Recorded Directly In The **Ledger Entry** To Ensure Future Audits Match The Settlement Price.

---

## 🔒 Problem 4: Security (Field-Level Envelope Encryption)
Sensitive Identifiers (Wallets, UserIds) Are Never Stored In Plaintext.

### Encryption Hierarchy:
1. **Master Key (MK)**: Stored In Environment/KMS.
2. **Data Encryption Key (DEK)**: A Unique Key Generated Per Database Row.
3. **Encryption**: Row Data Is Encrypted With The DEK Using **AES-256-CBC**.
4. **Storage**: The DEK Is Itself Encrypted With The MK (The "Envelope") And Stored alongside The Encrypted Data. This Minimizes The Blast Radius Of Any Key Leak.

---

## ⛓️ Audit Hash Chain
Every `LedgerEntry` Is Link-Chained. The Hash Of Entry N includes the Hash of Entry N-1.
`Hash = SHA256(PreviousHash + Amount + TransactionId + Timestamp)`
Tampering With Record #500 Breaks The Integrity Of Every Subsequent Record, Enabling Immediate Detection Of Unauthorized DB Mutations.
