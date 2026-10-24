import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import { authService } from '../services/authService';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';

export default function Alerts() {
  const currentUser = authService.getCurrentUser();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlertsData = async () => {
    try {
      setLoading(true);
      const alertsData = await alertService.getAlerts();
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load security alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
  }, []);

  const handleResolve = async (id) => {
    try {
      await alertService.resolveAlert(id);
      await loadAlertsData();
    } catch (err) {
      alert('Failed to resolve alert: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Security & Integrity Alerts
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Automated behavioral risk scoring and statutory anomaly monitoring.
          </p>
        </div>

        <button onClick={loadAlertsData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
          Active Security Notifications
        </h2>

        {alerts.length === 0 ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            border: '1px solid #BBF7D0',
            color: '#16A34A'
          }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>All Security Profiles Normal</div>
            <div style={{ fontSize: '0.82rem', color: '#15803D', marginTop: '2px' }}>
              Zero behavioral anomalies or unauthorized download bursts detected.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {alerts.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: '10px',
                  backgroundColor: a.resolved ? '#F8FAFC' : '#FEF2F2',
                  border: a.resolved ? '1px solid #E2E8F0' : '1px solid #FECACA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: a.resolved ? '#E2E8F0' : '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: a.resolved ? '#64748B' : '#DC2626',
                    flexShrink: 0
                  }}>
                    <AlertTriangle size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: a.resolved ? '#475569' : '#DC2626' }}>
                        {a.ruleViolated}
                      </span>
                      <span className={`badge ${a.resolved ? 'badge-neutral' : 'badge-tampered'}`} style={{ fontSize: '0.68rem' }}>
                        Risk Score: {a.riskScore}/100
                      </span>
                      {a.resolved && (
                        <span className="badge badge-verified" style={{ fontSize: '0.68rem' }}>
                          Resolved
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                      Associated Identity: <strong>{a.username}</strong> • Time: {new Date(a.timestamp).toLocaleString()}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                      {a.details}
                    </div>
                  </div>
                </div>

                {!a.resolved && (
                  <button
                    onClick={() => handleResolve(a.id)}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#CBD5E1', fontSize: '0.8rem' }}
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
