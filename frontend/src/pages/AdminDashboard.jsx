import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertService } from '../services/alertService';
import { ledgerService } from '../services/ledgerService';
import { evidenceService } from '../services/evidenceService';
import {
  Users,
  AlertTriangle,
  FileText,
  Wrench,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Boxes
} from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [ledgerStats, setLedgerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, alertsData, stats] = await Promise.all([
        alertService.getUsers(),
        alertService.getAlerts(),
        ledgerService.getStats(),
      ]);

      setUsers(usersData);
      setAlerts(alertsData);
      setLedgerStats(stats);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const totalUsers = users.length;
  const lockedUsers = users.filter((u) => u.accountLocked).length;
  const activeUsers = totalUsers - lockedUsers;
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;

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
            Administration
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            System monitoring, user account governance, and security controls.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadAdminData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href="/admin/users"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
            title="Open JSP Admin View"
          >
            <ExternalLink size={14} />
            JSP Admin Console
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Users</span>
            <Users size={18} color="#2563EB" />
          </div>
          <div className="stat-value">{totalUsers}</div>
          <div className="stat-sub">Provisioned system identities</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Active Users</span>
            <ShieldCheck size={18} color="#16A34A" />
          </div>
          <div className="stat-value" style={{ color: '#16A34A' }}>
            {activeUsers}
          </div>
          <div className="stat-sub">Authorized for daily operations</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Locked Accounts</span>
            <Lock size={18} color={lockedUsers > 0 ? '#DC2626' : '#64748B'} />
          </div>
          <div className="stat-value" style={{ color: lockedUsers > 0 ? '#DC2626' : '#0F172A' }}>
            {lockedUsers}
          </div>
          <div className="stat-sub">
            {lockedUsers > 0 ? 'Requires administrative review' : 'Zero locked accounts'}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Security Alerts</span>
            <AlertTriangle size={18} color={unresolvedAlerts > 0 ? '#DC2626' : '#16A34A'} />
          </div>
          <div className="stat-value" style={{ color: unresolvedAlerts > 0 ? '#DC2626' : '#16A34A' }}>
            {unresolvedAlerts}
          </div>
          <div className="stat-sub">
            {unresolvedAlerts > 0 ? 'Active anomaly warnings' : 'Normal behavioral baseline'}
          </div>
        </div>
      </div>

      {/* 4 Quick Management Action Cards */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
          Administrative Modules
        </h2>

        <div className="grid-4">
          <Link to="/admin/users" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                User Management
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '4px' }}>
                View accounts, check status, and lock or unlock user credentials.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#2563EB', fontWeight: 600, marginTop: 'auto' }}>
              Manage Users <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/admin/alerts" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626'
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                Security Alerts
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '4px' }}>
                Review behavioral anomaly alerts, risk evaluations, and resolve notifications.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#DC2626', fontWeight: 600, marginTop: 'auto' }}>
              Review Alerts <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/admin/audit" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#F0F9FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                Audit Reports
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '4px' }}>
                Inspect chain of custody logs, print compliance reports, and open JSP audit views.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#0284C7', fontWeight: 600, marginTop: 'auto' }}>
              View Reports <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/admin/tools" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}>
              <Wrench size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                Demo Tools
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '4px' }}>
                Execute controlled tamper and attack simulations for academic demonstrations.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#475569', fontWeight: 600, marginTop: 'auto' }}>
              Open Demo Tools <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
