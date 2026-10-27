# EvidenceChain: AI-Assisted Blockchain-Based Cybercrime Evidence Integrity Management System

[![Java](https://img.shields.io/badge/Java-17%2B-blue.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18%20(Vite)-61dafb.svg)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/Database-H2%20%7C%20MySQL-orange.svg)](https://www.h2database.com/)
[![Build Status](https://img.shields.io/badge/Tests-19%2F19%20Passing-success.svg)]()

> **College Web Technology Course Project**  
> An end-to-end full-stack cybercrime forensic evidence management system engineered to guarantee unbroken chain-of-custody (ISO/IEC 27037 compliant) through custom SHA-256 blockchain anchoring, AI-driven behavioral anomaly detection with automatic lockout, dual-layer forensic fingerprinting, and a dual-tier UI (modern React frontend + raw Servlet/JSP administration portal).

---

## 📑 Table of Contents
1. [System Architecture](#system-architecture)
2. [Prerequisites & Quick Start](#prerequisites--quick-start)
3. [Default Role Accounts](#default-role-accounts)
4. [Database & Profiles (H2 vs MySQL)](#database--profiles-h2-vs-mysql)
5. [Entity Relationship (ER) Diagram](#entity-relationship-er-diagram)
6. [Complete REST API Reference](#complete-rest-api-reference)
7. [Core Capabilities & Innovation](#core-capabilities--innovation)
8. [5-Minute Live Viva Demo Script](#5-minute-live-viva-demo-script)
9. [Viva Q&A Preparation Notes](#viva-qa-preparation-notes)
10. [Project Directory Structure](#project-directory-structure)

---

## 🏛 System Architecture

EvidenceChain employs a defense-in-depth, dual-interface architecture:
- **Client Tier**: Modern Vite + React single-page application communicating via stateless JWT with `/api/**`.
- **Administrative Tier**: Session-based Form-authenticated JSP/JSTL portal served by raw `HttpServlet` implementations (`AdminLoginServlet`, `AuditReportServlet`) via Spring Boot embedded Tomcat Jasper at `/admin/**`.
- **Security Tier**: Two distinct Spring Security filter chains (`@Order(1)` stateless JWT and `@Order(2)` stateful session cookies).
- **Core Forensic Engines**: Pure Java SHA-256 blockchain ledger, heuristic pre-screening analyzer, behavioral z-score anomaly engine, and OpenPDF certificate renderer with dynamic ZXing QR codes.

```mermaid
flowchart TD
    subgraph Client_Tier["Client Presentation Tier"]
        UI_React["React 18 + Vite SPA<br/>(Port: 5173)<br/>Evidence List, Detail, Upload, Ledger, Alerts"]
        UI_JSP["Admin JSP / JSTL Portal<br/>(Port: 8080 /admin)<br/>User Mgmt, Printable Audit Reports, Stats"]
    end

    subgraph Security_Gate["Dual Spring Security Filter Chains"]
        Chain_API["@Order(1) /api/**<br/>Stateless JWT Auth Filter"]
        Chain_Admin["@Order(2) /admin/**<br/>Stateful Form Login + Session"]
    end

    subgraph Controller_Tier["Service & Controller Tier"]
        REST_Ctrl["Spring REST Controllers<br/>(/api/auth, /api/evidence, /api/ledger, /api/alerts)"]
        Raw_Servlets["Raw HttpServlets<br/>(AdminLoginServlet, AuditReportServlet)"]
    end

    subgraph Forensic_Engines["AI & Cryptographic Engines (Pure Java)"]
        Engine_Ledger["Custom Blockchain Service<br/>(SHA-256 Genesis-to-Tip Chain Validation)"]
        Engine_PreScreen["Heuristic Pre-Screening Engine<br/>(Magic-Byte vs Ext spoofing, EXIF, Size anomaly)"]
        Engine_Anomaly["Behavioral AI Anomaly Engine<br/>(Rule engine + Z-Score actions/hr baseline -> Lockout)"]
        Engine_Text["Forensic Text & Privacy Engine<br/>(PII Auto-redaction, Smart Summary extraction)"]
        Engine_Cert["Certificate Engine<br/>(OpenPDF + ZXing Dynamic QR Code)"]
    end

    subgraph Data_Storage["Persistent Storage Tier"]
        DB_H2["H2 Database (File Mode: ./data/evidencechain)<br/>(Optional Profile: MySQL 8)"]
        Disk_Storage["Local Storage Directory<br/>(/storage - Files stored isolated from ledger)"]
    end

    UI_React -->|Bearer JWT| Chain_API --> REST_Ctrl
    UI_JSP -->|JSESSIONID Cookie| Chain_Admin --> Raw_Servlets

    REST_Ctrl --> Engine_Ledger
    REST_Ctrl --> Engine_PreScreen
    REST_Ctrl --> Engine_Anomaly
    REST_Ctrl --> Engine_Text
    REST_Ctrl --> Engine_Cert

    Raw_Servlets --> DB_H2
    Engine_Ledger --> DB_H2
    Engine_Anomaly --> DB_H2
    REST_Ctrl --> Disk_Storage
```

---

## 🚀 Prerequisites & Quick Start

### 1. Prerequisites
- **Java**: JDK 17 or higher (tested with JDK 17, 21, and 25)
- **Maven**: Apache Maven 3.9+
- **Node.js**: v18+ & npm

### 2. Running the Backend (Spring Boot 3)
```powershell
# Open a terminal in the backend directory
cd C:\Users\ABHI\.gemini\antigravity\scratch\evidence-chain\backend

# Run the Spring Boot application (Embedded Tomcat + Jasper for JSP support)
mvn spring-boot:run
```
> The backend boots up on **`http://localhost:8080`**.  
> The H2 database (`./data/evidencechain`) and initial demo cases are automatically seeded on startup.

### 3. Running the Frontend (React + Vite)
```powershell
# Open a second terminal in the frontend directory
cd C:\Users\ABHI\.gemini\antigravity\scratch\evidence-chain\frontend

# Install dependencies (first time only)
npm install

# Start the Vite development server
npm run dev
```
> The frontend application is live at **`http://localhost:5173`**.

### 4. Accessing the Administrative JSP Portal
Open your browser and navigate directly to:
**`http://localhost:8080/admin/login`**

---

## 👥 Primary Demo Role Accounts

EvidenceChain provides three simplified user-facing role accounts initialized out-of-the-box:

| Username | Password | Role | Agency / Jurisdiction | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **`police`** | `Password123!` | **POLICE** | Metropolitan Police Forensics Unit | Upload evidence, view assigned cases, verify hashes, initiate custody transfers |
| **`judge`** | `Password123!` | **JUDGE** | District Judiciary Cyber Bench | Read-only judicial review, SHA-256 verification, custody audit, PDF certificate export |
| **`admin`** | `AdminPassword123!` | **ADMIN** | IT & Infrastructure Command | User management, security anomaly alerts, audit reports, attack & tamper simulation |

*(Legacy accounts `officer_chen` and `judge_vance` are retained in the database initializer for backwards compatibility).*

---

## 🗄 Database & Profiles (H2 vs MySQL)

### Default: H2 Database (File Mode)
Out-of-the-box, EvidenceChain runs with zero external database configuration using file-backed H2:
- JDBC URL: `jdbc:h2:file:./data/evidencechain`
- H2 Web Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/evidencechain`, User: `sa`, Password: `password`)

### Optional: MySQL Profile
To switch to an enterprise MySQL 8 instance:
1. Ensure MySQL is running on port 3306 and create the database:
   ```sql
   CREATE DATABASE evidencechain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Inspect or update `backend/src/main/resources/application-mysql.properties`.
3. Launch Spring Boot with the `mysql` profile:
   ```powershell
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```
4. A standard DDL script is provided at `backend/src/main/resources/schema.sql`.

---

## 📊 Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ EVIDENCE : "registers / owns"
    USERS ||--o{ CUSTODY_LOGS : "performs actions"
    USERS ||--o{ SECURITY_ALERTS : "triggers / targeted"
    USERS ||--o| USER_ACTIVITY_STATS : "has activity baseline"
    EVIDENCE ||--|| BLOCKS : "anchored in"
    EVIDENCE ||--o{ CUSTODY_LOGS : "tracked by"

    USERS {
        bigint id PK
        varchar username UK
        varchar password "BCrypt"
        varchar full_name
        varchar role "POLICE, JUDGE, ADMIN"
        varchar badge_number
        varchar agency
        boolean account_locked
        timestamp created_at
    }

    EVIDENCE {
        bigint id PK
        varchar case_number
        varchar title
        varchar description
        varchar file_name
        varchar file_type
        bigint file_size
        varchar file_hash "SHA-256"
        varchar storage_path
        varchar location
        timestamp collection_timestamp
        int authenticity_score "0-100"
        varchar heuristic_flags
        varchar auto_tags "LOG, IMAGE, EMAIL, etc."
        boolean tampered
        bigint registered_by_id FK
        bigint current_owner_id FK
        bigint block_id FK
        timestamp created_at
    }

    BLOCKS {
        bigint id PK
        bigint block_index UK
        bigint timestamp
        bigint evidence_id
        varchar file_hash "SHA-256"
        int authenticity_score
        bigint investigator_id
        varchar previous_hash "SHA-256"
        varchar block_hash "SHA-256 (All fields)"
    }

    CUSTODY_LOGS {
        bigint id PK
        bigint evidence_id FK
        varchar case_number
        bigint user_id FK
        varchar username
        varchar user_role
        varchar action "UPLOAD, VIEW, DOWNLOAD, VERIFY, TRANSFER, TAMPER_SIMULATION"
        timestamp timestamp
        varchar ip_address
        varchar notes
    }

    SECURITY_ALERTS {
        bigint id PK
        bigint user_id FK
        varchar username
        varchar alert_type "NIGHT_ACCESS, DOWNLOAD_BURST, VERIFY_FAIL, ZSCORE_ANOMALY"
        int risk_score "0-100"
        varchar description
        varchar ip_address
        timestamp timestamp
        boolean resolved
    }

    USER_ACTIVITY_STATS {
        bigint id PK
        bigint user_id UK
        double mean_actions_per_hour
        double std_dev_actions_per_hour
        int sample_count
        timestamp last_updated
    }
```

---

## 📡 Complete REST API Reference

All `/api/**` endpoints require a Bearer JWT passed in the `Authorization: Bearer <token>` header (except `/api/auth/login`).

### Authentication (`/api/auth`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | PUBLIC | Validates credentials; returns JWT token, role, and profile info |
| `GET` | `/api/auth/me` | ALL AUTHENTICATED | Returns details of the currently authenticated principal |

### Evidence Management (`/api/evidence`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/evidence/upload` | POLICE, ADMIN | Uploads multipart file + metadata, computes SHA-256, screens heuristics, tags, and mints block |
| `GET` | `/api/evidence` | ALL | Lists evidence with filtering by `caseNumber`, `tag`, and `search` query |
| `GET` | `/api/evidence/{id}` | ALL | Retrieves metadata, cryptographic hash, block link, and screening flags |
| `GET` | `/api/evidence/{id}/download` | ALL | Downloads physical file from disk and appends a `DOWNLOAD` custody log entry |
| `POST` | `/api/evidence/{id}/verify` | ALL | Re-hashes file from disk, compares with ledger block, logs `VERIFY`, checks chain |
| `POST` | `/api/evidence/{id}/transfer` | POLICE, ADMIN | Transfers evidence legal custody to target officer with mandatory audit notes |
| `POST` | `/api/evidence/{id}/tamper-simulate` | ADMIN | **Demo**: Inverts 1 byte in physical file on disk to trigger live tamper mismatch |
| `GET` | `/api/evidence/{id}/certificate` | ALL | Generates official ISO-grade OpenPDF Certificate with embedded dynamic ZXing QR |
| `GET` | `/api/evidence/{id}/redacted` | ALL | Generates on-the-fly PII-redacted text copy (emails, phones, SSNs, cards masked) |
| `GET` | `/api/evidence/{id}/summary` | ALL | Extracts forensic intelligence (IPs, emails, timestamps, keyword frequencies) |

### Blockchain Ledger (`/api/ledger`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ledger/blocks` | ALL | Returns list of all blocks in sequential ledger order |
| `GET` | `/api/ledger/validate` | ALL | Validates complete hash chain from Genesis (Block 0) to Tip; pinpoints broken block |

### Chain of Custody (`/api/custody`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/custody/evidence/{evidenceId}` | ALL | Chronological custody audit trail for specific artifact |
| `GET` | `/api/custody/recent` | ALL | Returns 25 most recent cross-agency custodial actions |

### AI Security Alerts & Anomaly Simulation (`/api/alerts`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/alerts` | ALL | Lists active behavioral anomaly alerts |
| `POST` | `/api/alerts/{id}/resolve` | ADMIN | Marks a security alert as investigated and resolved |
| `POST` | `/api/alerts/simulate-attack` | ADMIN | **Demo**: Generates simulated burst attacks to exceed threshold and trigger lockout |
| `POST` | `/api/alerts/unlock-user/{id}` | ADMIN | Clears account lockout flag and enables user login |

---

## 💡 Core Capabilities & Innovation

### 1. Custom SHA-256 Blockchain Ledger
Unlike bloated external blockchains (Ethereum, Hyperledger) requiring external nodes and gas tokens, EvidenceChain embeds a purpose-built, high-performance forensic blockchain:
- **Genesis Block**: Seeded at application initialization (Index `0`, `previousHash = "0"`).
- **Block Composition**:
  $$\text{BlockHash} = \text{SHA256}(\text{Index} + \text{Timestamp} + \text{EvidenceId} + \text{FileHash} + \text{AuthenticityScore} + \text{InvestigatorId} + \text{PreviousHash})$$
- **Chain Validation**: Recursively checks that every block's `previousHash` equals the prior block's hash, and re-computes each block's cryptographic digest. If any historical block or evidence pointer is altered in the database, the validator instantly pinpoints the exact compromised block index.

### 2. Dual-Layer Cryptographic Fingerprinting
- **Layer 1 (Absolute Integrity)**: Full 256-bit cryptographic digest calculated over the raw byte stream upon receipt.
- **Layer 2 (Heuristic Pre-Screening Authenticity)**: Pure Java rule engine scoring the artifact from 0 to 100:
  - *MIME Spoofing*: Checks whether extension matches magic bytes (e.g., `.png` file containing `\x89PNG\r\n\x1a\n`, `.jpg` containing `\xFF\xD8\xFF`, `.pdf` containing `%PDF-`, `.pcap` containing `\xD4\xC3\xB2\xA1`).
  - *Temporal Inconsistencies*: Flags future timestamps or collection times pre-dating file creation.
  - *Size Anomalies*: Flags truncated or suspiciously hollow captures (< 32 bytes).

### 3. AI Behavioral Anomaly Detection & Auto-Lockout
A dual-engine surveillance algorithm monitors every user action in real-time:
1. **Deterministic Heuristics**:
   - Night Access rule (actions between 00:00 and 05:00 UTC/local).
   - Rapid Exfiltration rule (> 5 raw file downloads in a 10-minute window).
   - Tamper Attack rule (repeated cryptographic verification failures).
   - Unauthorized Access rule (accessing cases not assigned to agency).
2. **Statistical Z-Score Baseline**:
   Tracks actions per hour per user against their personal running mean ($\mu$) and standard deviation ($\sigma$):
   $$Z = \frac{x - \mu}{\sigma}$$
   If an activity spike yields $Z > 2.5$, a statistical anomaly risk penalty is applied. If total combined risk exceeds the configurable threshold (70/100), the engine **immediately sets `account_locked = true`**, terminates active privileges, and bars subsequent logins until an Administrator unlocks the persona.

### 4. Judicial Integrity Certificate with Dynamic ZXing QR Code
Generates a court-admissible PDF document using OpenPDF:
- Formatted with formal cyber tribunal headers and seal.
- Embeds Case Number, Artifact Name, File SHA-256 Digest, Ledger Block Index, Block Hash, Seizure Location, and Custodian.
- Embeds a dynamic QR code (generated via Google ZXing) linking directly to the verification endpoint for instant mobile validation.

### 5. Forensic Privacy Redaction & Entity Extraction
- **Auto-Redaction**: Scans evidentiary logs and emails using high-speed regular expressions to redact emails, phone numbers, government IDs, and payment card numbers (`[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_GOV_ID]`, etc.), while ensuring the **original file and ledger hash remain completely untouched**.
- **Smart Summary**: Automatically parses text artifacts to extract network IP addresses, email communication channels, chronological timestamps, and high-frequency forensic keywords.

---

## 🎬 5-Minute Live Viva Demo Script

Follow this step-by-step sequence to demonstrate the entire system to examiners:

### Step 1: Login as Investigator (Police Persona)
1. Go to `http://localhost:5173`.
2. Click the quick persona button **"Inspector Chen (Police)"** and hit **"Sign In"**.
3. View the **Dashboard** displaying live counts, recent custody logs, and system risk scores.

### Step 2: Upload Evidence & Mint Block
1. Click **"Upload Evidence"** in the navigation bar.
2. Select the preset **"Server Access Log"** (or upload any file).
3. Fill in Case: `CASE-2026-DEMO`, Location: `Cybercrime Lab Room 4B`.
4. Click **"Upload & Anchor on Blockchain"**.
5. Note the instant results:
   - SHA-256 hash calculated.
   - Dual-layer authenticity score: `100/100 (Consistent header signatures)`.
   - Classification Tag: `LOG`.
   - Minted to **Block #N** on the ledger.

### Step 3: Verify Integrity & Generate Judicial Certificate
1. On the **Evidence Detail** page, click the green **"Verify Integrity"** button.
2. Observe the banner: **`VERIFICATION PASSED: Cryptographic Match Confirmed`**.
3. Click **"Integrity Certificate PDF"**: view the generated PDF certificate with tribunal watermark and dynamic ZXing QR code.
4. Click **"Redacted Copy"**: show the PII masking of suspect emails and phone numbers.
5. Click **"Smart Summary"**: showcase pure Java extraction of IP addresses (`192.168.1.105`) and keywords.

### Step 4: Live Tamper Simulation (The "Aha!" Moment)
1. Log out, then click **"Admin HQ"** and log in as `admin` (or stay logged in).
2. Go to the evidence item uploaded in Step 2.
3. Click the red **"Simulate Tamper"** button. Confirm the alert.
   > *Explanation to Examiner*: "The system just flipped 1 byte directly inside the physical file stored on disk, simulating a malicious database admin or hacker altering digital evidence."
4. Click **"Verify Integrity"**.
5. Observe the immediate red alert: **`TAMPER DETECTED: Cryptographic Hash Mismatch!`**.
   - Show how the computed file hash deviates from the immutable hash anchored on the blockchain.

### Step 5: Trigger AI Attack Lockout & Inspect Alerts
1. Navigate to **"Security Alerts"**.
2. Click the red button **"Simulate Suspicious Activity"** (or target `officer_chen`).
3. Notice a flurry of high-risk actions generated: Risk Score jumps to **85/100**.
4. The system flags: `ACCOUNT AUTOMATICALLY LOCKED: High risk score (85) exceeds threshold`.
5. Try logging in as the targeted user: access is blocked with `"Account is locked due to security anomalies"`.

### Step 6: Unlock Account via the Raw Servlet / JSP Admin Portal
1. Open a new tab to **`http://localhost:8080/admin/login`**.
2. Log in with `admin` / `admin123`.
3. You are now inside the **raw Servlet + JSP/JSTL Admin Portal**!
4. Navigate to **"User Management"**: locate the locked user and click **"Unlock"**.
5. Navigate to **"Audit Reports"**: view the formal printable Case Audit Trail with ISO/IEC 27037 timestamp logs.

---

## 🎓 Viva Q&A Preparation Notes

### Q1: Why did you build a custom blockchain rather than using Ethereum or Hyperledger Fabric?
> **Answer**:
> "For a cybercrime evidence management system, public blockchains like Ethereum introduce unacceptable friction: volatile gas fees for every custody event, public visibility of sensitive case metadata, transaction latency of 15 seconds to minutes, and external dependency vulnerabilities. Hyperledger Fabric, on the other hand, requires heavy Docker container orchestration (orderers, peers, certificate authorities) which adds immense operational overhead.
> Our custom Java blockchain implements the mathematical core of blockchain technology — sequential block hashing, cryptographic parent pointers (`previousHash`), genesis anchoring, and proof-of-state verification — with sub-millisecond execution, zero gas fees, complete local autonomy, and total auditability that can be easily inspected and explained line-by-line during a viva."

### Q2: Why are raw files stored on disk and only hashes on the blockchain ledger?
> **Answer**:
> "Storing multi-megabyte binary evidence (disk images, PCAPs, video footage) directly on a blockchain causes severe 'state bloat', degrades node synchronization, and breaches data privacy laws (e.g., GDPR right-to-be-forgotten vs blockchain immutability).
> In compliance with ISO/IEC 27037 standards for digital evidence handling, EvidenceChain isolates the physical artifact in secure file storage (`/storage`), while committing only the irreversible 256-bit SHA-256 digest to the immutable ledger. Any modification to the disk file alters its computed hash, immediately failing comparison against the immutable ledger hash."

### Q3: How does the Dual-Layer Fingerprinting differ from regular hashing?
> **Answer**:
> "Standard forensic systems only compute a hash after the fact. EvidenceChain adds an AI heuristic pre-screening layer at the moment of ingest. It inspects the binary magic bytes against file extension to detect masquerading malware (e.g., an executable disguised as `.png`), analyzes temporal timestamps for timestamp tampering, and flags size anomalies. This generates an Authenticity Score (0-100) anchored directly alongside the SHA-256 digest in the block."

### Q4: How is the behavioral anomaly detection implemented without heavy external ML models?
> **Answer**:
> "We intentionally chose a hybrid deterministic-plus-statistical approach (Rule-Based + Gaussian Z-Score) implemented in pure Java:
> 1. *Deterministic Rules*: Check for temporal violations (access between midnight and 5:00 AM), burst exfiltration (> 5 downloads in 10 minutes), and repeated verification failures.
> 2. *Statistical Z-Score*: We maintain a running Gaussian distribution (mean $\mu$ and standard deviation $\sigma$) of hourly action frequency for each investigator. If an hourly action count $x$ exceeds a Z-score of $+2.5$ ($z = \frac{x - \mu}{\sigma}$), it mathematically flags an outlier (>99th percentile).
> If the combined risk score crosses 70, the system automatically locks the account in real-time."

### Q5: Explain the Dual Security Filter Chain implementation in Spring Security 6.
> **Answer**:
> "Our application serves two completely different client paradigms from the same Spring Boot binary:
> - **Filter Chain 1 (`@Order(1)`)**: Configured for `/api/**`. It is completely stateless (`SessionCreationPolicy.STATELESS`), disables CSRF (since JWTs are immune to standard CSRF when stored in auth headers), and executes `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`.
> - **Filter Chain 2 (`@Order(2)`)**: Configured for `/admin/**`. It is stateful (`SessionCreationPolicy.IF_REQUIRED`), enables session cookies, uses Spring Security's form login (`/admin/login`), and redirects authenticated administrators to JSP views.
> Keeping them strictly isolated prevents session fixation and token leakage across paradigms."

### Q6: How do raw Servlets function alongside Spring MVC and JSP in Spring Boot?
> **Answer**:
> "Spring Boot is packaged as a `.war` file and includes `tomcat-embed-jasper` and `jakarta.servlet.jsp.jstl`. We instantiated raw `HttpServlet` subclasses (`AdminLoginServlet` and `AuditReportServlet`) and registered them via `ServletRegistrationBean` beans with specific URL mappings. When a request hits `/admin/audit-report`, the raw servlet executes its `doGet` method, populates request attributes, and forwards to `/WEB-INF/jsp/admin-audit-report.jsp` using `RequestDispatcher`."

---

## 📂 Project Directory Structure

```text
evidence-chain/
├── backend/
│   ├── pom.xml                                   # Spring Boot 3, Jasper, OpenPDF, ZXing, JJWT
│   └── src/
│       ├── main/
│       │   ├── java/com/evidencechain/
│       │   │   ├── EvidenceChainApplication.java # Spring Boot WAR entry point
│       │   │   ├── ai/
│       │   │   │   ├── AnomalyDetectionService.java     # Rules + Z-Score behavioral lockout
│       │   │   │   ├── AutoTaggingService.java          # Automatic file classification
│       │   │   │   └── HeuristicFingerprintService.java # Magic-byte pre-screening engine
│       │   │   ├── controller/
│       │   │   │   ├── AdminPortalController.java       # JSP Admin endpoints
│       │   │   │   ├── AlertController.java             # Anomaly alerts & attack simulation
│       │   │   │   ├── AuthController.java              # JWT authentication endpoints
│       │   │   │   ├── CustodyController.java           # Chain of custody audit endpoints
│       │   │   │   ├── EvidenceController.java          # Upload, verify, tamper, cert, redacted
│       │   │   │   └── LedgerController.java            # Blockchain blocks & chain validation
│       │   │   ├── dto/                             # Request and Response transfer objects
│       │   │   ├── ledger/
│       │   │   │   ├── BlockchainService.java           # Minting, genesis, chain integrity checks
│       │   │   │   └── HashUtil.java                    # SHA-256 byte and string hashing
│       │   │   ├── model/                           # JPA Entities (User, Evidence, Block, CustodyLog, etc.)
│       │   │   ├── repository/                      # Spring Data JPA repositories
│       │   │   ├── security/                        # Dual filter chains, JWT provider, UserPrincipal
│       │   │   ├── service/
│       │   │   │   ├── CertificateService.java          # OpenPDF certificate + ZXing QR code
│       │   │   │   ├── CustodyService.java              # Immutable custody action logger
│       │   │   │   ├── DemoDataSeeder.java              # Seeds users, cases, files on startup
│       │   │   │   ├── EvidenceService.java             # Core lifecycle & tamper simulation
│       │   │   │   └── ForensicTextAnalysisService.java # PII regex redaction & smart summary
│       │   │   └── servlet/
│       │   │       ├── AdminLoginServlet.java           # Raw HttpServlet for Admin authentication
│       │   │       ├── AuditReportServlet.java          # Raw HttpServlet for printable case audit
│       │   │       └── ServletConfig.java               # ServletRegistrationBean declarations
│       │   ├── resources/
│       │   │   ├── application.properties           # H2 file mode, JWT secret, storage paths
│       │   │   ├── application-mysql.properties     # Optional MySQL production profile
│       │   │   └── schema.sql                       # Standard MySQL DDL schema
│       │   └── webapp/WEB-INF/jsp/                  # JSP templates
│       │       ├── admin-login.jsp                  # Styled Admin login page
│       │       ├── admin-users.jsp                  # User management & lockout unlock
│       │       ├── admin-audit-report.jsp           # Printable ISO-compliant case report
│       │       └── admin-stats.jsp                  # System forensic metrics overview
│       └── test/java/com/evidencechain/             # 19 Unit & Integration Tests (100% passing)
│           ├── AdminPortalTest.java                 # JSP & Servlet integration test
│           ├── AnomalyDetectionServiceTest.java     # Rules & Z-score lockout tests
│           ├── AuthControllerTest.java              # JWT auth and role tests
│           ├── BlockchainServiceTest.java           # Ledger minting & tamper pinpoint tests
│           ├── EvidenceLifecycleTest.java           # Full upload-verify-tamper integration test
│           ├── ForensicTextAnalysisTest.java        # PII redaction & entity extraction tests
│           └── HashUtilTest.java                    # Cryptographic SHA-256 unit tests
├── frontend/
│   ├── package.json                                 # React 18, Vite, Axios, React Router, Lucide
│   ├── vite.config.js                               # Proxy to Spring Boot on :8080
│   └── src/
│       ├── components/Navbar.jsx, StatusBadge.jsx   # Shared UI components
│       ├── pages/
│       │   ├── Login.jsx                            # Quick persona login switcher
│       │   ├── Dashboard.jsx                        # Metrics, recent activity, alerts feed
│       │   ├── UploadEvidence.jsx                   # Dropzone, presets, real-time block feedback
│       │   ├── EvidenceList.jsx                     # Search & tag category filters
│       │   ├── EvidenceDetail.jsx                   # Metadata, fingerprint, verify, tamper, cert
│       │   ├── LedgerExplorer.jsx                   # Visual block explorer & chain validity badge
│       │   ├── Alerts.jsx                           # AI anomaly log & attack simulator
│       │   └── LedgerNodes.jsx                      # Simulated multi-agency consensus view
│       └── services/                                # Axios API client services
├── docs/                                            # Supporting documentation
└── storage/                                         # Physical file repository (isolated from ledger)
```
