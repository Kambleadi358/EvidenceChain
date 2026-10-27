<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EvidenceChain Admin - System Telemetry</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0b0f19;
            color: #f1f5f9;
            margin: 0;
            padding: 0;
        }
        .navbar {
            background-color: #111827;
            border-bottom: 1px solid #1e293b;
            padding: 16px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .nav-brand {
            font-weight: 800;
            font-size: 1.2rem;
            color: #fff;
        }
        .nav-links {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .nav-links a {
            color: #94a3b8;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 6px;
        }
        .nav-links a:hover, .nav-links a.active {
            color: #fff;
            background-color: #1e293b;
        }
        .container {
            max-width: 1200px;
            margin: 32px auto;
            padding: 0 20px;
        }
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 24px;
        }
        .card {
            background-color: #111827;
            border: 1px solid #1e293b;
            border-radius: 10px;
            padding: 24px;
        }
        .stat-val {
            font-size: 2rem;
            font-weight: 800;
            color: #38bdf8;
            margin: 6px 0;
        }
        .stat-lbl {
            font-size: 0.8rem;
            color: #94a3b8;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.04em;
        }
        .badge-green {
            background-color: rgba(16, 185, 129, 0.2);
            color: #34d399;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        .badge-red {
            background-color: rgba(239, 68, 68, 0.2);
            color: #f87171;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <header class="navbar">
        <div class="nav-brand">EvidenceChain Admin Portal</div>
        <nav class="nav-links">
            <a href="${pageContext.request.contextPath}/admin/users">User Management</a>
            <a href="${pageContext.request.contextPath}/admin/audit-report">Audit Trail Reports</a>
            <a href="${pageContext.request.contextPath}/admin/stats" class="active">System Telemetry</a>
            <a href="http://localhost:5173" target="_blank">&larr; Main React App</a>
            <a href="${pageContext.request.contextPath}/admin/logout" style="color: #f87171;">Logout</a>
        </nav>
    </header>

    <main class="container">
        <h1 style="font-size: 1.5rem; margin-bottom: 8px;">System Performance & Cryptographic Telemetry</h1>
        <p style="color: #94a3b8; font-size: 0.88rem; margin-bottom: 24px;">Underlying Java 17 + Spring Boot 3 + H2 cluster status.</p>

        <div class="grid-3">
            <div class="card">
                <div class="stat-lbl">Evidence Records</div>
                <div class="stat-val">${evidenceCount}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Physical files stored in /storage</div>
            </div>

            <div class="card">
                <div class="stat-lbl">Blockchain Height</div>
                <div class="stat-val" style="color: #c084fc;">${blockCount}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Minted SHA-256 blocks in DB</div>
            </div>

            <div class="card">
                <div class="stat-lbl">Blockchain Integrity</div>
                <div style="margin: 12px 0;">
                    <c:choose>
                        <c:when test="${chainStatus.valid}">
                            <span class="badge-green">100% INTACT & VALID</span>
                        </c:when>
                        <c:otherwise>
                            <span class="badge-red">BREACH AT BLOCK #${chainStatus.brokenBlockIndex}</span>
                        </c:otherwise>
                    </c:choose>
                </div>
                <div style="font-size: 0.75rem; color: #64748b;">${chainStatus.reason}</div>
            </div>

            <div class="card">
                <div class="stat-lbl">Registered Personnel</div>
                <div class="stat-val" style="color: #60a5fa;">${userCount}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Police, Judge, Admin</div>
            </div>

            <div class="card">
                <div class="stat-lbl">Custody Events Logged</div>
                <div class="stat-val" style="color: #fbbf24;">${logCount}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Immutable historical transactions</div>
            </div>

            <div class="card">
                <div class="stat-lbl">AI Security Incidents</div>
                <div class="stat-val" style="color: #f87171;">${alertCount}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Behavioral anomaly triggers</div>
            </div>
        </div>

        <div class="card">
            <h2 style="font-size: 1.1rem; margin-top: 0;">JVM Runtime Environment</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 16px; font-size: 0.88rem;">
                <div>
                    <div style="color: #94a3b8;">Heap Memory Allocated:</div>
                    <div style="font-weight: 700; font-size: 1.1rem; color: #fff;">${totalMemory} MB</div>
                </div>
                <div>
                    <div style="color: #94a3b8;">Heap Memory Used:</div>
                    <div style="font-weight: 700; font-size: 1.1rem; color: #38bdf8;">${usedMemory} MB</div>
                </div>
                <div>
                    <div style="color: #94a3b8;">Heap Memory Free:</div>
                    <div style="font-weight: 700; font-size: 1.1rem; color: #34d399;">${freeMemory} MB</div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
