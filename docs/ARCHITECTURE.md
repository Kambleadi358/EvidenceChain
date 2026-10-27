# EvidenceChain: System Architecture & Technical Specifications

This document outlines the detailed technical architecture, design patterns, and cryptographic principles implemented in the **EvidenceChain** platform.

---

## 1. High-Level Architectural Patterns

EvidenceChain follows a decoupled, layered enterprise architecture built around domain-driven design principles:

1. **Client Tier**:
   - **Modern Forensic Single-Page Application (SPA)**: Built with React 18 and Vite. Uses declarative routing (`react-router-dom`), centralized API interceptors (`axios`), and responsive CSS variables with Dark-Mode cyber-forensic aesthetics.
   - **Administrative JSP/Servlet Portal**: Served directly by the Spring Boot WAR container using `tomcat-embed-jasper` and JSTL 3.0. Directly executes raw `HttpServlet` implementations.

2. **Security & Boundary Tier**:
   - Implements **Dual Security Filter Chains** via Spring Security 6 (`SecurityFilterChain`).
   - Strict physical and logical separation between API tokens (`/api/**`) and administrative session state (`/admin/**`).

3. **Domain & Service Tier**:
   - **Blockchain Service**: Deterministic SHA-256 block minting, genesis generation, and unbroken sequential link validation.
   - **Heuristic Fingerprinting**: File header inspection, binary magic-byte matching, temporal validity checks.
   - **Behavioral Anomaly Engine**: Rule-based trigger evaluation combined with statistical Gaussian Z-Score anomaly detection.
   - **Forensic Privacy Engine**: Regex-driven PII redaction and smart artifact summarization.
   - **Certificate Engine**: OpenPDF dynamic document rendering with 2D ZXing QR matrix generation.

4. **Persistence Tier**:
   - **Spring Data JPA & Hibernate 6**: Object-Relational Mapping with optimistic locking and indexed foreign key relationships.
   - **H2 Database (Default File Mode)**: Zero-configuration local database persistence located at `./data/evidencechain`.
   - **MySQL 8 (Enterprise Profile)**: Production-grade profile configured via `application-mysql.properties` and `schema.sql`.
   - **Physical File Repository (`/storage`)**: Disconnected storage location where evidence files are written to disk, ensuring large binary blobs never touch the blockchain.

---

## 2. Cryptographic Blockchain Mechanics

### Block Data Structure
Every block committed to the ledger represents an immutable evidentiary milestone:

```java
public class Block {
    private Long id;
    private Long blockIndex;        // Sequential block index (0, 1, 2, ...)
    private Long timestamp;         // Milliseconds since Unix epoch
    private Long evidenceId;        // Associated evidence entity primary key (0 for Genesis)
    private String fileHash;        // SHA-256 of the evidentiary file on disk
    private Integer authenticityScore; // Heuristic pre-screening score (0-100)
    private Long investigatorId;    // User ID who registered or transferred the item
    private String previousHash;    // 64-hex SHA-256 of the immediate predecessor block
    private String blockHash;       // 64-hex SHA-256 of all fields above
}
```

### Hashing Algorithm
The block's digital seal is computed using standard NIST FIPS 180-4 SHA-256:

$$\text{data} = \text{blockIndex} + \text{timestamp} + \text{evidenceId} + \text{fileHash} + \text{authenticityScore} + \text{investigatorId} + \text{previousHash}$$

$$\text{blockHash} = \text{SHA256}(\text{data})$$

### Genesis Block Initialization
Upon first startup, `BlockchainService.initGenesisBlock()` checks if any blocks exist. If the chain is empty, it permanently writes Block #0:
- `blockIndex = 0`
- `timestamp = 1704067200000L` (Fixed reference timestamp)
- `evidenceId = 0L`
- `fileHash = "0000000000000000000000000000000000000000000000000000000000000000"`
- `authenticityScore = 100`
- `investigatorId = 0L`
- `previousHash = "0"`
- `blockHash = SHA256(Genesis Fields)`

### Full Chain Verification Algorithm
When `/api/ledger/validate` is invoked, the chain verification procedure:
1. Verifies Genesis Block parameters (`index == 0`, `previousHash == "0"`).
2. Recursively traverses all blocks ordered by `blockIndex ASC`.
3. Re-computes $\text{SHA256}(\text{fields})$ for block $i$ and asserts equality with stored `blockHash`.
4. Asserts that $\text{previousHash}_i == \text{blockHash}_{i-1}$.
5. If any assertion fails, it immediately halts and returns:
   - `valid = false`
   - `brokenBlockIndex = i`
   - Diagnostic detail identifying whether the fault is an internal field mutation or a broken parent pointer.

---

## 3. Dual Security Filter Chain Architecture

Spring Security 6 allows declaring multiple `@Bean SecurityFilterChain` instances ordered with `@Order`:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Filter Chain 1: API (Stateless JWT)
    @Bean
    @Order(1)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**")
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/evidence/*/download", "/api/evidence/*/certificate").permitAll()
                .requestMatchers("/api/evidence/upload", "/api/evidence/*/transfer").hasAnyRole("POLICE", "ADMIN")
                .requestMatchers("/api/evidence/*/tamper-simulate", "/api/alerts/simulate-attack", "/api/alerts/unlock-user/*").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Filter Chain 2: Admin JSP Portal (Stateful Session Cookie)
    @Bean
    @Order(2)
    public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/admin/**")
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/admin/login", "/admin/login-process", "/css/**", "/js/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/admin/login")
                .loginProcessingUrl("/admin/login-process")
                .defaultSuccessUrl("/admin/users", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/admin/logout")
                .logoutSuccessUrl("/admin/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );
        return http.build();
    }
}
```

---

## 4. AI Anomaly Detection & Statistical Math

The system evaluates risk score $R \in [0, 100]$ using a compound formula:

$$R = \min\left(100, R_{\text{heuristic}} + R_{\text{zscore}}\right)$$

### Heuristic Risk Scoring ($R_{\text{heuristic}}$)
- **Night Access Flag**: Actions executed between 00:00:00 and 05:00:00 local time: $+35 \text{ pts}$.
- **Download Burst Flag**: More than 5 raw file downloads in a rolling 10-minute window: $+40 \text{ pts}$.
- **Repeated Verification Failures**: More than 2 consecutive failed verifications on files owned by user: $+45 \text{ pts}$.
- **Cross-Jurisdiction / Unassigned Access**: Officer viewing evidence in a foreign case: $+30 \text{ pts}$.

### Statistical Z-Score Anomaly ($R_{\text{zscore}}$)
Each user's action frequency is profiled into hourly buckets $x_t$. The system maintains:
- Sample count $N$
- Running Mean: $\mu = \frac{1}{N} \sum_{i=1}^N x_i$
- Standard Deviation: $\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^N (x_i - \mu)^2}$

For current activity $x$, the standard score is:
$$Z = \frac{x - \mu}{\sigma}$$

When $Z > 2.5$ (exceeding $99.38\%$ of normal behavioral baseline), the system assigns:
$$R_{\text{zscore}} = \min(40, \lfloor (Z - 2.0) \times 20 \rfloor)$$

### Automated Account Lockout
If $R \ge 70$, the service executes:
```java
user.setAccountLocked(true);
userRepository.save(user);
```
Subsequent attempts to log in via `/api/auth/login` or `/admin/login-process` are immediately aborted with an `AccountLockedException`.
