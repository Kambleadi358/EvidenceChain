import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import StatusBadge from '../components/StatusBadge';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  RefreshCw,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function Certificates() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const data = await evidenceService.list();
      setEvidenceList(data);
    } catch (err) {
      console.error('Failed to load certificates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const handleDownload = async (e, id, caseNumber) => {
    e.preventDefault();
    try {
      setDownloadingId(id);
      await evidenceService.downloadCertificate(id, `Evidence_Certificate_${caseNumber}_#${id}.pdf`);
    } catch (err) {
      alert('Could not download certificate: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenPdf = async (e, id) => {
    e.preventDefault();
    try {
      await evidenceService.openCertificateInNewTab(id);
    } catch (err) {
      alert('Could not open certificate: ' + (err.response?.data?.message || err.message));
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
            Evidence Integrity Certificates
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Download and export cryptographically verified PDF certificates for courtroom presentation.
          </p>
        </div>

        <button onClick={loadEvidence} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Info Card */}
      <div className="card" style={{
        marginBottom: '24px',
        padding: '18px 22px',
        backgroundColor: '#F0FDF4',
        border: '1px solid #BBF7D0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <FileText size={24} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#15803D', lineHeight: 1.55 }}>
          <strong>Cryptographic Forensic Certificate:</strong> Each certificate includes the full SHA-256 fingerprint, blockchain ledger block hash, custody seizure timestamp, chain validation status, and official judicial verification seal.
        </div>
      </div>

      {/* Certificates Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem' }}
              placeholder="Search by case number or evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Available certificates: <strong>{filtered.length}</strong>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Evidence Title</th>
                <th>File Name</th>
                <th>Block Ref</th>
                <th>Integrity Status</th>
                <th style={{ textAlign: 'right' }}>Certificate Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No certificates available.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
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
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(ev) => handleDownload(ev, e.id, e.caseNumber)}
                          disabled={downloadingId === e.id}
                          className="btn btn-primary btn-sm"
                        >
                          <FileText size={14} className={downloadingId === e.id ? 'animate-spin' : ''} />
                          {downloadingId === e.id ? 'Generating PDF...' : 'Download PDF Certificate'}
                        </button>
                        <button
                          type="button"
                          onClick={(ev) => handleOpenPdf(ev, e.id)}
                          className="btn btn-outline btn-sm"
                          title="Open PDF Certificate in New Tab"
                        >
                          <ExternalLink size={14} />
                          Open
                        </button>
                        <Link to={`/evidence/${e.id}`} className="btn btn-outline btn-sm">
                          Review
                        </Link>
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
