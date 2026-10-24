import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import { alertService } from '../services/alertService';
import {
  Wrench,
  AlertTriangle,
  Zap,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

export default function AdminTools() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [tamperLoading, setTamperLoading] = useState(false);
  const [tamperResult, setTamperResult] = useState(null);

  const [targetUsername, setTargetUsername] = useState('police');
  const [attackLoading, setAttackLoading] = useState(false);
  const [attackResult, setAttackResult] = useState(null);

  useEffect(() => {
    evidenceService.list().then((data) => {
      setEvidenceList(data);
      if (data.length > 0) {
        setSelectedEvidenceId(data[0].id.toString());
      }
    }).catch(console.error);
  }, []);

  const handleSimulateTamper = async () => {
    if (!selectedEvidenceId) return;

    const confirmed = window.confirm(
      "CONFIRM DEMONSTRATION ACTION:\n\nThis will invert physical bits of the stored evidence file on disk to simulate forensic tampering.\n\nThe immutable blockchain block hash will remain untouched so verification will detect the mismatch.\n\nProceed with tamper simulation?"
    );
    if (!confirmed) return;

    try {
      setTamperLoading(true);
      setTamperResult(null);
      const res = await evidenceService.simulateTamper(selectedEvidenceId);
      setTamperResult(res);
    } catch (err) {
      alert("Tamper simulation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setTamperLoading(false);
    }
  };

  const handleSimulateAttack = async () => {
    const confirmed = window.confirm(
      `CONFIRM DEMONSTRATION ACTION:\n\nThis will simulate an insider cyberattack on user '${targetUsername}'.\n\nIt will inject rapid exfiltration downloads and failed verification checks to trigger the anomaly engine and lock the account.\n\nProceed?`
    );
    if (!confirmed) return;

    try {
      setAttackLoading(true);
      setAttackResult(null);
      const res = await alertService.simulateAttack(targetUsername);
      setAttackResult(res);
    } catch (err) {
      alert("Attack simulation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setAttackLoading(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Demonstration Tools
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
          Administrative harnesses for testing cryptographic tamper detection and anomaly protection.
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 18px',
        borderRadius: '8px',
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
        color: '#D97706',
        fontSize: '0.85rem',
        marginBottom: '28px'
      }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>College Examiner Notice:</strong> These demonstration tools alter files or test accounts strictly for academic evaluation of integrity detection and anomaly mechanisms. Never execute against production evidence.
        </div>
      </div>

      <div className="grid-2" style={{ gap: '28px' }}>
        {/* Tool 1: Tamper Simulation */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
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
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                Evidence Tamper Simulation
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Physical file byte corruption test
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.55, marginBottom: '20px' }}>
            Directly alters one byte in the physical file on the server's disk storage without changing the blockchain reference block. When subsequently verified, the SHA-256 calculation will immediately reveal an integrity mismatch.
          </p>

          <div className="form-group">
            <label className="form-label">Target Evidence Record</label>
            <select
              className="form-select"
              value={selectedEvidenceId}
              onChange={(e) => setSelectedEvidenceId(e.target.value)}
            >
              {evidenceList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.caseNumber} — {e.fileName} ({e.title})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSimulateTamper}
            disabled={tamperLoading || !selectedEvidenceId}
            className="btn btn-danger"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {tamperLoading ? 'Injecting Corruption...' : 'Simulate Evidence Tampering'}
          </button>

          {tamperResult && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 700, marginBottom: '6px' }}>
                <CheckCircle2 size={16} />
                {tamperResult.message}
              </div>
              <div style={{ color: '#475569', fontSize: '0.8rem' }}>
                Target File: <strong>{tamperResult.fileName}</strong> (ID: {tamperResult.evidenceId})
              </div>
              <div style={{ marginTop: '10px' }}>
                <Link to={`/evidence/${tamperResult.evidenceId}`} className="btn btn-outline btn-sm" style={{ borderColor: '#DC2626', color: '#DC2626' }}>
                  Verify Integrity Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Tool 2: Attack Simulation */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}>
              <Zap size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                Insider Exfiltration Attack Simulation
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Rapid burst exfiltration test harness
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.55, marginBottom: '20px' }}>
            Simulates 6 rapid evidence downloads and 3 failed cryptographic verification attempts from a single user identity. Tests the anomaly detection engine's automatic account lockout threshold.
          </p>

          <div className="form-group">
            <label className="form-label">Target User Identity</label>
            <select
              className="form-select"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
            >
              <option value="police">police (Police Officer)</option>
              <option value="officer_chen">officer_chen (Legacy Police)</option>
            </select>
          </div>

          <button
            onClick={handleSimulateAttack}
            disabled={attackLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {attackLoading ? 'Simulating Attack Burst...' : 'Trigger Attack Simulation'}
          </button>

          {attackResult && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 700, marginBottom: '6px' }}>
                <CheckCircle2 size={16} />
                Attack Pattern Simulated
              </div>
              <div style={{ color: '#475569', fontSize: '0.8rem' }}>
                Target: <strong>{attackResult.targetUsername}</strong> | Calculated Risk Score: <strong style={{ color: '#DC2626' }}>{attackResult.riskScore}/100</strong>
              </div>
              <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '2px' }}>
                Account Locked: <strong>{attackResult.accountLocked ? 'YES (Lockout enforced)' : 'NO'}</strong>
              </div>
              <div style={{ marginTop: '10px' }}>
                <Link to="/admin/users" className="btn btn-outline btn-sm">
                  View in User Management <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
