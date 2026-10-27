import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ledgerService } from '../services/ledgerService';
import { Network, Server, ShieldCheck, ShieldAlert, Cpu, Activity, RefreshCw, Boxes, ArrowLeft } from 'lucide-react';

export default function LedgerNodes() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadNodeStats = async () => {
    try {
      setLoading(true);
      const data = await ledgerService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load ledger node stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNodeStats();
  }, []);

  const nodes = [
    {
      id: 'NODE-POLICE-01',
      name: 'Metropolitan Police Cybercrime Node',
      agency: 'State Police Department',
      role: 'PRIMARY_INTAKE (Upload & Evidence Seizure)',
      ip: '10.240.12.55',
      latency: '4ms',
      storageMode: 'H2 File Cluster Engine'
    },
    {
      id: 'NODE-ADMIN-02',
      name: 'EvidenceChain Administrative Audit Node',
      agency: 'System Administration & Security Operations',
      role: 'ADMIN_AUDIT (Tamper Simulation, User Management & Anomaly Detection)',
      ip: '10.240.18.91',
      latency: '6ms',
      storageMode: 'H2 File Cluster Engine'
    },
    {
      id: 'NODE-JUDICIAL-03',
      name: 'High Court Appellate Registry Node',
      agency: 'State Judiciary Special Cyber Bench',
      role: 'JUDICIAL_SEAL (Read-Only Verification & PDF Certificate Stamp)',
      ip: '10.240.4.12',
      latency: '11ms',
      storageMode: 'H2 File Cluster Engine'
    }
  ];

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Multi-Agency Ledger Consensus Nodes
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '4px' }}>
            Simulated multi-node architecture ensuring Police, Judiciary, and Admin/Audit authorities share a single tamper-evident ledger.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/ledger" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} />
            Ledger Explorer
          </Link>
          <button onClick={loadNodeStats} className="btn btn-primary btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Sync Nodes
          </button>
        </div>
      </div>

      {/* Consensus Summary Banner */}
      <div className="card" style={{
        marginBottom: '28px',
        border: stats?.isValid ? '1px solid #BBF7D0' : '1px solid #FECACA',
        background: stats?.isValid ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: stats?.isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stats?.isValid ? '#16A34A' : '#DC2626'
            }}>
              <Network size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Multi-Agency Consensus Status: {stats?.isValid ? 'SYNCHRONIZED (100%)' : 'DESYNCHRONIZED / BREACH'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                All 3 statutory authorities are actively validating block height #{stats?.totalBlocks || 0}.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>BLOCK HEIGHT</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563EB' }}>
                #{stats?.totalBlocks || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>PEER HEALTH</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16A34A' }}>
                3 / 3 Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Node Cards Grid */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        {nodes.map((node, i) => (
          <div key={node.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{node.id}</span>
                <span className="badge badge-verified" style={{ fontSize: '0.68rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--verified-green)' }}></span>
                  ONLINE
                </span>
              </div>

              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                {node.name}
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '16px' }}>
                {node.agency}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>STATUTORY ROLE</div>
                  <div style={{ fontWeight: 600, color: '#2563EB' }}>{node.role}</div>
                </div>

                <div>
                  <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>LOCAL VALIDATION STATUS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    {stats?.isValid ? (
                      <span style={{ color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} /> Chain Validated
                      </span>
                    ) : (
                      <span style={{ color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldAlert size={14} /> Tamper Detected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>NODE INTERNAL IP</div>
                  <div className="font-mono" style={{ color: '#475569' }}>{node.ip}</div>
                </div>
              </div>
            </div>

            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#94A3B8'
            }}>
              <span>Latency: {node.latency}</span>
              <span>Sync: Block #{stats?.totalBlocks || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Explanation Card for Viva Defense */}
      <div className="card" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          Educational Viva Note: Multi-Agency Decentralized Architecture
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.6' }}>
          In traditional criminal investigations, digital evidence stored in isolated police silos is vulnerable to unilateral modification or suppression.
          EvidenceChain implements a shared cryptographic blockchain ledger where State Police, the Admin/Audit authority, and Judicial Court registrars
          operate peer consensus nodes. Once an evidence block is minted and stamped with SHA-256 parent block linkages, any unilateral alteration of the file
          or database on one agency node immediately invalidates the entire chain across all partner agency nodes.
        </p>
      </div>
    </div>
  );
}
