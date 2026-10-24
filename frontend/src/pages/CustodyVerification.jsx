import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function CustodyVerification() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [results, setResults] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const data = await evidenceService.list();
      setEvidenceList(data);
    } catch (err) {
      console.error('Failed to load evidence for verification', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const handleVerifyOne = async (id) => {
    try {
      setVerifyingId(id);
      const res = await evidenceService.verify(id);
      setResults((prev) => ({ ...prev, [id]: res }));
      // Reload list
      const updated = await evidenceService.list();
      setEvidenceList(updated);
    } catch (err) {
      alert("Verification failed: " + (err.response?.data?.message || err.message));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyAll = async () => {
    for (const item of evidenceList) {
      await handleVerifyOne(item.id);
    }
  };

  const filtered = evidenceList.filter((e) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (e.caseNumber && e.caseNumber.toLowerCase().includes(q))
      || (e.title && e.title.toLowerCase().includes(q))
      || (e.fileName && e.fileName.toLowerCase().includes(q));
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
            Evidence Integrity Verification
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Recalculate physical file SHA-256 digests on the server and compare with immutable blockchain records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadEvidence} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleVerifyAll}
            disabled={evidenceList.length === 0}
            className="btn btn-primary btn-sm"
          >
            <ShieldCheck size={15} />
            Batch Verify All Records
          </button>
        </div>
      </div>

      {/* Verification Explanation Card */}
      <div className="card" style={{
        marginBottom: '24px',
        padding: '18px 22px',
        backgroundColor: '#EFF6FF',
        border: '1px solid #DBEAFE',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldCheck size={24} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#1E40AF', lineHeight: 1.55 }}>
          <strong>Verification Process:</strong> When you select "Verify Integrity", the server recalculates the SHA-256 hash of the stored file directly from disk storage and compares it with the immutable hash anchored in the blockchain block. A matching hash confirms that the file has remained byte-for-byte identical to its state at collection time.
        </div>
      </div>

      {/* Evidence Verification Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem' }}
              placeholder="Filter by case or file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Total records to verify: <strong>{filtered.length}</strong>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Evidence Title</th>
                <th>File Name</th>
                <th>Block #</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No evidence records found.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const res = results[e.id];
                  return (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                        {e.caseNumber}
                      </td>
                      <td>
                        <Link to={`/evidence/${e.id}`} style={{ fontWeight: 600, color: '#0F172A' }}>
                          {e.title}
                        </Link>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {e.fileName}
                      </td>
                      <td>
                        <span className="hash-pill" style={{ fontSize: '0.72rem' }}>
                          Block #{e.blockIndex}
                        </span>
                      </td>
                      <td>
                        <StatusBadge isTampered={e.tampered} />
                        {res && (
                          <div style={{
                            fontSize: '0.72rem',
                            marginTop: '4px',
                            color: res.verified ? '#16A34A' : '#DC2626',
                            fontWeight: 600
                          }}>
                            {res.verified ? '✓ Match Confirmed' : '✗ Tamper Divergence!'}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleVerifyOne(e.id)}
                            disabled={verifyingId === e.id}
                            className="btn btn-primary btn-sm"
                          >
                            <ShieldCheck size={14} />
                            {verifyingId === e.id ? 'Checking...' : 'Verify Now'}
                          </button>
                          <Link to={`/evidence/${e.id}`} className="btn btn-outline btn-sm">
                            Inspect
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
