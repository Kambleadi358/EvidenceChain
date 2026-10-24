import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import { ledgerService } from '../services/ledgerService';
import { alertService } from '../services/alertService';
import StatusBadge from '../components/StatusBadge';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  Share2
} from 'lucide-react';

export default function PoliceDashboard() {
  const [stats, setStats] = useState({
    totalEvidence: 0,
    verifiedEvidence: 0,
    integrityAlerts: 0,
    pendingTransfers: 0,
  });
  const [evidenceList, setEvidenceList] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allEvidence, alerts, logs] = await Promise.all([
        evidenceService.list(),
        alertService.getAlerts(),
        evidenceService.getRecentCustody(),
      ]);

      const verifiedCount = allEvidence.filter((e) => !e.tampered).length;
      const tamperedCount = allEvidence.filter((e) => e.tampered).length;
      const transferCount = logs.filter((l) => l.action === 'TRANSFER').length;

      setStats({
        totalEvidence: allEvidence.length,
        verifiedEvidence: verifiedCount,
        integrityAlerts: tamperedCount,
        pendingTransfers: transferCount,
      });

      setEvidenceList(allEvidence);
      setRecentLogs(logs.slice(0, 6));
    } catch (err) {
      console.error('Failed to load police dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEvidence = evidenceList.filter((e) => {
    if (statusFilter === 'VERIFIED' && e.tampered) return false;
    if (statusFilter === 'TAMPERED' && !e.tampered) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = (e.fileName && e.fileName.toLowerCase().includes(q))
        || (e.caseNumber && e.caseNumber.toLowerCase().includes(q))
        || (e.title && e.title.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Police Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage evidence and monitor integrity status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/evidence/upload" className="btn btn-primary btn-sm">
            <UploadCloud size={15} />
            + Upload Evidence
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Evidence</span>
            <FileCheck2 size={18} color="#2563EB" />
          </div>
          <div className="stat-value">{stats.totalEvidence}</div>
          <div className="stat-sub">Assigned forensic records</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Verified Evidence</span>
            <ShieldCheck size={18} color="#16A34A" />
          </div>
          <div className="stat-value" style={{ color: '#16A34A' }}>
            {stats.verifiedEvidence}
          </div>
          <div className="stat-sub">SHA-256 match confirmed</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Integrity Alerts</span>
            <AlertTriangle size={18} color={stats.integrityAlerts > 0 ? '#DC2626' : '#16A34A'} />
          </div>
          <div className="stat-value" style={{ color: stats.integrityAlerts > 0 ? '#DC2626' : '#16A34A' }}>
            {stats.integrityAlerts}
          </div>
          <div className="stat-sub">
            {stats.integrityAlerts > 0 ? 'Hash mismatch flagged' : 'No integrity breaches'}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Custody Transfers</span>
            <Share2 size={18} color="#0284C7" />
          </div>
          <div className="stat-value">{stats.pendingTransfers}</div>
          <div className="stat-sub">Recorded chain transfers</div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '24px' }}>
        {/* Left Column: Recent Evidence Table */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                Recent Evidence Intake
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Cryptographically registered digital artifacts
              </div>
            </div>

            <Link to="/evidence" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '32px', fontSize: '0.82rem', padding: '7px 10px 7px 30px' }}
                placeholder="Search file name, case ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ fontSize: '0.82rem', padding: '7px 10px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="TAMPERED">Tampered</option>
            </select>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Case ID</th>
                  <th>Uploaded Date</th>
                  <th>Integrity Status</th>
                  <th>Custodian</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidence.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                      No evidence records match your criteria. Click '+ Upload Evidence' to add new records.
                    </td>
                  </tr>
                ) : (
                  filteredEvidence.slice(0, 6).map((e) => (
                    <tr key={e.id}>
                      <td>
                        <Link to={`/evidence/${e.id}`} style={{ fontWeight: 600, color: '#0F172A' }}>
                          {e.fileName}
                        </Link>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{e.title}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#2563EB', fontSize: '0.82rem' }}>
                        {e.caseNumber}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {e.uploadedAt ? new Date(e.uploadedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <StatusBadge isTampered={e.tampered} />
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {e.currentOwnerName || e.investigatorName || 'Police Custody'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/evidence/${e.id}`} className="btn btn-outline btn-sm">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                Recent Activity
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Chain of custody events log
              </div>
            </div>
            <Link to="/ledger" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              Full Ledger
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.85rem' }}>
                No recent activity logged yet.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${
                      log.action === 'UPLOAD' ? 'badge-info' :
                      log.action === 'VERIFY' ? 'badge-verified' :
                      log.action === 'TRANSFER' ? 'badge-warning' : 'badge-neutral'
                    }`} style={{ fontSize: '0.65rem' }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    {log.username}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Case: {log.caseNumber || 'N/A'} • {log.note || 'Recorded in chain of custody'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
