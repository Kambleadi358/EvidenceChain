# EvidenceChain: REST API Reference Manual

Base URL: `http://localhost:8080/api`  
Security: Bearer JWT passed in header: `Authorization: Bearer <jwt-token>`

---

## 1. Authentication Endpoints

### 1.1 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "officer_chen",
  "password": "police123"
}
```
- **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "officer_chen",
  "fullName": "Inspector David Chen",
  "role": "POLICE",
  "badgeNumber": "NYPD-CYBER-8821",
  "agency": "Metro Police Cybercrime Division",
  "accountLocked": false
}
```

### 1.2 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "id": 1,
  "username": "officer_chen",
  "fullName": "Inspector David Chen",
  "role": "POLICE",
  "badgeNumber": "NYPD-CYBER-8821",
  "agency": "Metro Police Cybercrime Division",
  "accountLocked": false
}
```

---

## 2. Evidence Endpoints

### 2.1 Upload & Mint Evidence
- **Endpoint**: `POST /api/evidence/upload`
- **Content-Type**: `multipart/form-data`
- **Access**: `POLICE`, `ADMIN`
- **Form Fields**:
  - `file`: Binary file upload
  - `caseNumber`: `CASE-2026-CY01`
  - `title`: `Core Banking Unauthorized SSH Exfiltration Log`
  - `description`: `Extracted from DMZ bastion jump host`
  - `location`: `Financial Sector Data Center Server Rack 12`
  - `collectionTimestamp`: `2026-10-18T14:30:00`
- **Response (201 Created)**:
```json
{
  "id": 1,
  "caseNumber": "CASE-2026-CY01",
  "title": "Core Banking Unauthorized SSH Exfiltration Log",
  "description": "Extracted from DMZ bastion jump host",
  "fileName": "auth_exfil_session.log",
  "fileType": "text/plain",
  "fileSize": 18432,
  "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "location": "Financial Sector Data Center Server Rack 12",
  "collectionTimestamp": "2026-10-18T14:30:00",
  "authenticityScore": 95,
  "heuristicFlags": "Verified consistent header signatures; Text format verified",
  "autoTags": "LOG, NETWORK_CAPTURE",
  "tampered": false,
  "registeredByName": "Inspector David Chen",
  "currentOwnerName": "Inspector David Chen",
  "blockIndex": 1,
  "blockHash": "5a41be742d48bfbc8682054ff476d91c53e0e7a83556c6a71ecb183658512e09",
  "createdAt": "2026-10-18T14:32:00"
}
```

### 2.2 List Evidence with Filtering
- **Endpoint**: `GET /api/evidence?caseNumber=CASE-2026-CY01&tag=LOG&search=SSH`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "caseNumber": "CASE-2026-CY01",
    "title": "Core Banking Unauthorized SSH Exfiltration Log",
    "fileName": "auth_exfil_session.log",
    "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "authenticityScore": 95,
    "autoTags": "LOG, NETWORK_CAPTURE",
    "tampered": false,
    "blockIndex": 1
  }
]
```

### 2.3 Verify Evidence Cryptographic Integrity
- **Endpoint**: `POST /api/evidence/{id}/verify`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "evidenceId": 1,
  "caseNumber": "CASE-2026-CY01",
  "verified": true,
  "status": "MATCH",
  "expectedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "actualHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "details": "Cryptographic match confirmed. File on disk matches immutable Block #1 on ledger.",
  "blockIndex": 1,
  "blockHash": "5a41be742d48bfbc8682054ff476d91c53e0e7a83556c6a71ecb183658512e09",
  "verificationTimestamp": "2026-10-18T14:35:10"
}
```

### 2.4 Simulate Tamper (Admin Only)
- **Endpoint**: `POST /api/evidence/{id}/tamper-simulate`
- **Access**: `ADMIN`
- **Response (200 OK)**:
```json
{
  "evidenceId": 1,
  "action": "TAMPER_SIMULATION",
  "status": "MODIFIED_ON_DISK",
  "details": "First physical byte on disk modified. Cryptographic verification will now detect mismatch against Block #1."
}
```

### 2.5 Transfer Evidence Custody
- **Endpoint**: `POST /api/evidence/{id}/transfer`
- **Access**: `POLICE`, `ADMIN`
- **Request Body**:
```json
{
  "targetUsername": "police",
  "transferNote": "Dispatched for forensic laboratory analysis"
}
```
- **Response (200 OK)**: Evidence Response updated with new `currentOwnerName`.

### 2.6 Privacy PII Auto-Redacted View
- **Endpoint**: `GET /api/evidence/{id}/redacted`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "evidenceId": 1,
  "fileName": "auth_exfil_session.log",
  "redactedContent": "2026-10-18 03:14:22 probe from suspect: [REDACTED_EMAIL], direct phone [REDACTED_PHONE].",
  "originalHashUntouched": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### 2.7 Smart Forensic Summary Extraction
- **Endpoint**: `GET /api/evidence/{id}/summary`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "evidenceId": 1,
  "fileName": "auth_exfil_session.log",
  "summary": {
    "extractedIps": ["192.168.1.105", "10.0.0.45"],
    "extractedEmails": ["admin-alerts@sec-corp.gov"],
    "extractedTimestamps": ["2026-10-18 03:14:22", "2026-10-18 03:14:25"],
    "topKeywords": ["payload (4)", "ransomware (3)", "probe (2)"]
  }
}
```

---

## 3. Blockchain Ledger Endpoints

### 3.1 List Blocks
- **Endpoint**: `GET /api/ledger/blocks`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "blockIndex": 0,
    "timestamp": 1704067200000,
    "evidenceId": 0,
    "fileHash": "0000000000000000000000000000000000000000000000000000000000000000",
    "authenticityScore": 100,
    "investigatorId": 0,
    "previousHash": "0",
    "blockHash": "2f4861eb77917f421a45b27c9dfbfb3523521c5cfc57ecc8588e99e0f00f3678"
  },
  {
    "id": 2,
    "blockIndex": 1,
    "timestamp": 1729261920000,
    "evidenceId": 1,
    "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "authenticityScore": 95,
    "investigatorId": 1,
    "previousHash": "2f4861eb77917f421a45b27c9dfbfb3523521c5cfc57ecc8588e99e0f00f3678",
    "blockHash": "5a41be742d48bfbc8682054ff476d91c53e0e7a83556c6a71ecb183658512e09"
  }
]
```

### 3.2 Validate Complete Blockchain Integrity
- **Endpoint**: `GET /api/ledger/validate`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "valid": true,
  "totalBlocks": 2,
  "brokenBlockIndex": null,
  "message": "Blockchain integrity intact. All block hashes and sequential parent pointers verified."
}
```

---

## 4. Custody Audit Trail Endpoints

### 4.1 Get Custody Logs for Evidence
- **Endpoint**: `GET /api/custody/evidence/{evidenceId}`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "evidenceId": 1,
    "caseNumber": "CASE-2026-CY01",
    "userId": 1,
    "username": "officer_chen",
    "userRole": "POLICE",
    "action": "UPLOAD",
    "timestamp": "2026-10-18T14:32:00",
    "ipAddress": "127.0.0.1",
    "notes": "Initial evidence seizure and blockchain anchoring"
  },
  {
    "id": 2,
    "evidenceId": 1,
    "caseNumber": "CASE-2026-CY01",
    "userId": 2,
    "username": "police",
    "userRole": "POLICE",
    "action": "VERIFY",
    "timestamp": "2026-10-18T14:35:10",
    "ipAddress": "127.0.0.1",
    "notes": "Cryptographic integrity verified against Block #1"
  }
]
```

---

## 5. Security Alerts & Anomaly Simulation

### 5.1 List Active Alerts
- **Endpoint**: `GET /api/alerts`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "username": "officer_chen",
    "alertType": "DOWNLOAD_BURST",
    "riskScore": 85,
    "description": "Rapid exfiltration detected: 6 downloads in 4 minutes",
    "ipAddress": "192.168.1.55",
    "timestamp": "2026-10-18T14:40:00",
    "resolved": false
  }
]
```

### 5.2 Simulate Attack Burst (Admin Only)
- **Endpoint**: `POST /api/alerts/simulate-attack`
- **Access**: `ADMIN`
- **Request Body**:
```json
{
  "targetUsername": "officer_chen"
}
```
- **Response (200 OK)**:
```json
{
  "targetUser": "officer_chen",
  "calculatedRiskScore": 85,
  "accountLocked": true,
  "details": "Simulated off-hours download burst executed. Risk score exceeds 70 threshold; account locked."
}
```

### 5.3 Unlock Account (Admin Only)
- **Endpoint**: `POST /api/alerts/unlock-user/{id}`
- **Access**: `ADMIN`
- **Response (200 OK)**:
```json
{
  "userId": 1,
  "username": "officer_chen",
  "status": "UNLOCKED",
  "accountLocked": false
}
```
