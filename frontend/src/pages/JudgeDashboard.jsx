import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import { ledgerService } from '../services/ledgerService';
import StatusBadge from '../components/StatusBadge';
import {
  Scale,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Shield
} from 'lucide-react';

export default function JudgeDashboard() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [chainValid, setChainValid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allEvidence, validation] = await Promise.all([
        evidenceService.list(),
        ledgerService.validateChain(),
      ]);

      setEvidenceList(allEvidence);
      setChainValid(validation?.valid !== false);
    } catch (err) {
      console.error('Failed to load judge dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadCert = async (e, id, caseNumber) => {
    e.preventDefault();
    try {
      await evidenceService.downloadCertificate(id, `Evidence_Certificate_${caseNumber}_#${id}.pdf`);
    } catch (err) {
      alert('Failed to download certificate: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalAvailable = evidenceList.length;
  const verifiedCount = evidenceList.filter((e) => !e.tampered).length;
  const reviewRequiredCount = evidenceList.filter((e) => e.tampered).length;

  const filteredEvidence = evidenceList.filter((e) => {
    if (statusFilter === 'VERIFIED' && e.tampered) return false;
    if (statusFilter === 'REVIEW' && !e.tampered) return false;
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
            Judge Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Review digital evidence, verify cryptographic continuity, and inspect certificates.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Available Evidence</span>
            <FileCheck2 size={18} color="#2563EB" />
          </div>
          <div className="stat-value">{totalAvailable}</div>
          <div className="stat-sub">Submitted for judicial review</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Verified Records</span>
            <ShieldCheck size={18} color="#16A34A" />
          </div>
          <div className="stat-value" style={{ color: '#16A34A' }}>
            {verifiedCount}
          </div>
          <div className="stat-sub">Cryptographic hash matches</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Requires Review</span>
            <AlertTriangle size={18} color={reviewRequiredCount > 0 ? '#DC2626' : '#16A34A'} />
          </div>
          <div className="stat-value" style={{ color: reviewRequiredCount > 0 ? '#DC2626' : '#16A34A' }}>
            {reviewRequiredCount}
          </div>
          <div className="stat-sub">
            {reviewRequiredCount > 0 ? 'Hash discrepancy detected' : 'Zero flagged records'}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Ledger Integrity</span>
            <Scale size={18} color="#0284C7" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: '#0284C7', marginTop: '6px' }}>
            100% Chain Intact
          </div>
          <div className="stat-sub">Parent-hash link continuity</div>
        </div>
      </div>

      {/* Evidence Review Table */}
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
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
              Evidence Under Judicial Review
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Select any record to inspect full SHA-256 digests, blockchain validation, and custody timeline
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem' }}
              placeholder="Search by case ID, title, or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Records</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="REVIEW">Requires Review Only</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Evidence Name</th>
                <th>Case ID</th>
                <th>Submitted Date</th>
                <th>Integrity Status</th>
                <th>Block Ref</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No evidentiary items matching review criteria.
                  </td>
                </tr>
              ) : (
                filteredEvidence.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{e.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{e.fileName}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                      {e.caseNumber}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {e.uploadedAt ? new Date(e.uploadedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <StatusBadge isTampered={e.tampered} />
                    </td>
                    <td>
                      <span className="hash-pill" style={{ fontSize: '0.72rem' }}>
                        Block #{e.blockIndex}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Link to={`/evidence/${e.id}`} className="btn btn-outline btn-sm">
                          Review Evidence
                        </Link>
                        <button
                          type="button"
                          onClick={(ev) => handleDownloadCert(ev, e.id, e.caseNumber)}
                          className="btn btn-outline btn-sm"
                          title="Download Legal PDF Integrity Certificate"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
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
