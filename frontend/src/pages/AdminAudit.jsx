import React, { useState, useEffect } from 'react';
import { evidenceService } from '../services/evidenceService';
import {
  FileText,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  User,
  Hash
} from 'lucide-react';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await evidenceService.getRecentCustody();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = (log.username && log.username.toLowerCase().includes(q))
        || (log.caseNumber && log.caseNumber.toLowerCase().includes(q))
        || (log.note && log.note.toLowerCase().includes(q))
        || (log.ipAddress && log.ipAddress.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="page-body">
      {/* Header */}
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
            Audit & Compliance Reports
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Statutory chain of custody logs, cryptographic timestamps, and academic evaluation reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadLogs} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href="/admin/audit-report"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            <ExternalLink size={14} />
            Launch JSP Forensic Audit Report
          </a>
        </div>
      </div>

      {/* Academic Integration Callout */}
      <div className="card" style={{
        marginBottom: '28px',
        padding: '20px 24px',
        backgroundColor: '#EFF6FF',
        border: '1px solid #DBEAFE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E40AF', marginBottom: '4px' }}>
            Syllabus Evaluation: Java Servlet / JSP Admin Portal
          </div>
          <p style={{ color: '#3B82F6', fontSize: '0.85rem' }}>
            The project retains full integration with the Jakarta Servlet & JSP administrative architecture (`/admin/audit-report`, `/admin/users`, `/admin/stats`).
          </p>
        </div>

        <a
          href="/admin/audit-report"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-sm"
          style={{ whiteSpace: 'nowrap' }}
        >
          <ExternalLink size={14} />
          Open JSP Audit Report
        </a>
      </div>

      {/* Logs Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '32px', fontSize: '0.82rem' }}
                placeholder="Search by case, username, IP, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ fontSize: '0.82rem' }}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="UPLOAD">UPLOAD</option>
              <option value="VERIFY">VERIFY</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="VIEW">VIEW</option>
              <option value="DOWNLOAD">DOWNLOAD</option>
              <option value="TAMPER_SIMULATION">TAMPER_SIMULATION</option>
            </select>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Displaying: <strong>{filteredLogs.length}</strong> events
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Case Number</th>
                <th>Actor (Username)</th>
                <th>IP Address</th>
                <th>Audit Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                    No audit log records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        log.action === 'UPLOAD' ? 'badge-info' :
                        log.action === 'VERIFY' ? 'badge-verified' :
                        log.action === 'TAMPER_SIMULATION' ? 'badge-tampered' :
                        log.action === 'TRANSFER' ? 'badge-warning' : 'badge-neutral'
                      }`} style={{ fontSize: '0.68rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#2563EB', fontSize: '0.82rem' }}>
                      {log.caseNumber || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                      {log.username} <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>({log.userRole})</span>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#64748B' }}>
                      {log.ipAddress || '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                      {log.note || 'Forensic custody transaction logged.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
