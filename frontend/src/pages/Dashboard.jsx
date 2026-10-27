import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import { ledgerService } from '../services/ledgerService';
import { alertService } from '../services/alertService';
import StatusBadge from '../components/StatusBadge';
import {
  FileCheck2,
  Boxes,
  ShieldCheck,
  ShieldAlert,
  UploadCloud,
  ArrowRight,
  RefreshCw,
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEvidence: 0,
    totalBlocks: 0,
    chainValid: true,
    activeAlerts: 0,
  });
  const [recentEvidence, setRecentEvidence] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [evidenceList, ledgerStats, alertsList, logs] = await Promise.all([
        evidenceService.list(),
        ledgerService.getStats(),
        alertService.getAlerts(),
        evidenceService.getRecentCustody(),
      ]);

      const unresolvedAlerts = alertsList.filter((a) => !a.resolved);

      setStats({
        totalEvidence: evidenceList.length,
        totalBlocks: ledgerStats.totalBlocks || 0,
        chainValid: ledgerStats.isValid,
        activeAlerts: unresolvedAlerts.length,
      });

      setRecentEvidence(evidenceList.slice(0, 5));
      setAlerts(unresolvedAlerts.slice(0, 4));
      setRecentLogs(logs.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Cybercrime Forensics Command Center
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Real-time evidence provenance, cryptographic blockchain verification, and AI risk monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadDashboardData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/upload" className="btn btn-primary btn-sm">
            <UploadCloud size={15} />
            Upload Evidence
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Evidence Records</span>
            <FileCheck2 size={20} color="var(--accent-blue)" />
          </div>
          <div className="stat-value">{stats.totalEvidence}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Indexed in secured vault</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Minted Ledger Blocks</span>
            <Boxes size={20} color="#7C3AED" />
          </div>
          <div className="stat-value" style={{ color: '#7C3AED' }}>{stats.totalBlocks}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Immutable SHA-256 blocks</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Blockchain Health</span>
            {stats.chainValid ? (
              <ShieldCheck size={20} color="var(--verified-green)" />
            ) : (
              <ShieldAlert size={20} color="var(--tampered-red)" />
            )}
          </div>
          <div className="stat-value" style={{ color: stats.chainValid ? 'var(--verified-green)' : 'var(--tampered-red)' }}>
            {stats.chainValid ? 'VERIFIED' : 'TAMPERED'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {stats.chainValid ? '100% Chain continuity intact' : 'Cryptographic breach detected!'}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">AI Anomaly Alerts</span>
            <AlertTriangle size={20} color={stats.activeAlerts > 0 ? '#DC2626' : '#16A34A'} />
          </div>
          <div className="stat-value" style={{ color: stats.activeAlerts > 0 ? '#DC2626' : '#16A34A' }}>
            {stats.activeAlerts}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {stats.activeAlerts > 0 ? 'High-risk anomalies flagged' : 'Normal activity profile'}
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px' }}>
        {/* Left Column: Recent Evidence Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>Recent Evidence Intake</h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Cryptographically stamped forensic artifacts</div>
            </div>
            <Link to="/evidence" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Title / File</th>
                  <th>Tags</th>
                  <th>Authenticity</th>
                  <th>Block</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEvidence.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                      No evidence records found. Click 'Upload Evidence' to intake the first item.
                    </td>
                  </tr>
                ) : (
                  recentEvidence.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600, color: '#2563EB' }}>{e.caseNumber}</td>
                      <td>
                        <Link to={`/evidence/${e.id}`} style={{ fontWeight: 600, color: '#0F172A' }}>
                          {e.title}
                        </Link>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{e.fileName}</div>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {e.autoTags ? e.autoTags.split(',')[0] : 'FILE'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: e.authenticityScore >= 90 ? 'var(--verified-green)' : 'var(--warning-amber)'
                        }}>
                          {e.authenticityScore}/100
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>#{e.blockIndex}</td>
                      <td>
                        <StatusBadge isTampered={e.tampered} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: AI Alerts & Audit Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active AI Alerts Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#DC2626" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>AI Anomaly & Risk Alerts</h2>
              </div>
              <Link to="/alerts" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>
                Manage Alerts
              </Link>
            </div>

            {alerts.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: 'var(--verified-green)',
                fontSize: '0.85rem'
              }}>
                <ShieldCheck size={28} style={{ margin: '0 auto 8px auto' }} />
                Zero anomaly breaches detected. All investigator baselines within statistical bounds.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map((a) => (
                  <div key={a.id} style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f87171' }}>
                        {a.ruleViolated}
                      </span>
                      <span className="badge badge-tampered" style={{ fontSize: '0.68rem' }}>
                        Risk: {a.riskScore}/100
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Target: <strong>{a.username}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.details}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Custody Log Stream */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Activity size={18} color="#2563EB" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Chain of Custody Feed</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentLogs.map((log) => (
                <div key={log.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${log.action === 'VERIFY' ? 'badge-verified' : log.action === 'TAMPER_SIMULATION' ? 'badge-tampered' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                      {log.action}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{log.username}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        Case: {log.caseNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
