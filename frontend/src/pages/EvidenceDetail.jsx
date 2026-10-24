import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import { authService } from '../services/authService';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Download,
  FileText,
  Clock,
  MapPin,
  Tag,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  Share2,
  RefreshCw,
  Eye,
  Boxes,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function EvidenceDetail() {
  const { id } = useParams();
  const currentUser = authService.getCurrentUser();
  const isJudge = currentUser?.role === 'JUDGE';
  const isAdmin = currentUser?.role === 'ADMIN';

  const [evidence, setEvidence] = useState(null);
  const [custodyLogs, setCustodyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Download states
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);

  // Transfer Modal State (Police / Admin only)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('judge');
  const [transferNote, setTransferNote] = useState('Submitted for judicial integrity review');
  const [transferring, setTransferring] = useState(false);

  const handleDownloadCertificate = async () => {
    try {
      setDownloadingCert(true);
      await evidenceService.downloadCertificate(id, `Evidence_Certificate_${evidence?.caseNumber || id}_#${id}.pdf`);
    } catch (err) {
      alert('Could not download certificate: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleDownloadFile = async () => {
    try {
      setDownloadingFile(true);
      await evidenceService.downloadEvidenceFile(id, evidence?.fileName);
    } catch (err) {
      alert('Could not download file: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingFile(false);
    }
  };

  // Redacted View Modal State
  const [showRedactedModal, setShowRedactedModal] = useState(false);
  const [redactedData, setRedactedData] = useState(null);
  const [loadingRedacted, setLoadingRedacted] = useState(false);

  // Summary Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evidenceData, logsData] = await Promise.all([
        evidenceService.getById(id),
        evidenceService.getCustodyLogs(id),
      ]);
      setEvidence(evidenceData);
      setCustodyLogs(logsData);
    } catch (err) {
      console.error('Failed to load evidence detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const res = await evidenceService.verify(id);
      setVerifyResult(res);
      // Reload logs and evidence
      const [updatedLogs, updatedEvidence] = await Promise.all([
        evidenceService.getCustodyLogs(id),
        evidenceService.getById(id)
      ]);
      setCustodyLogs(updatedLogs);
      setEvidence(updatedEvidence);
    } catch (err) {
      alert('Verification failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifying(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      setTransferring(true);
      await evidenceService.transfer(id, transferTarget, transferNote);
      setShowTransferModal(false);
      await loadData();
    } catch (err) {
      alert('Custody transfer failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setTransferring(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleViewRedacted = async () => {
    try {
      setLoadingRedacted(true);
      setShowRedactedModal(true);
      const data = await evidenceService.getRedacted(id);
      setRedactedData(data);
    } catch (err) {
      alert('Could not generate redacted view: ' + (err.response?.data?.error || err.message));
      setShowRedactedModal(false);
    } finally {
      setLoadingRedacted(false);
    }
  };

  const handleViewSummary = async () => {
    try {
      setLoadingSummary(true);
      setShowSummaryModal(true);
      const data = await evidenceService.getSummary(id);
      setSummaryData(data);
    } catch (err) {
      alert('Could not generate forensic summary: ' + (err.response?.data?.error || err.message));
      setShowSummaryModal(false);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '60px' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#2563EB' }} />
        <p style={{ color: '#64748B' }}>Loading cryptographic evidence record #{id}...</p>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '60px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>Evidence Record Not Found</h2>
        <p style={{ color: '#64748B', marginTop: '6px' }}>The requested evidence ID does not exist or access is unauthorized.</p>
        <Link to="/evidence" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Evidence Records
        </Link>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/evidence" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.85rem', marginBottom: '12px' }}>
          <ArrowLeft size={16} />
          Back to Evidence Records
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {evidence.title}
              </h1>
              <StatusBadge isTampered={evidence.tampered} />
            </div>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
              Case: <strong style={{ color: '#2563EB' }}>{evidence.caseNumber}</strong> • File: {evidence.fileName} ({(evidence.fileSize / 1024).toFixed(1)} KB)
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="btn btn-primary"
            >
              <ShieldCheck size={16} />
              {verifying ? 'Recalculating Digest...' : 'Verify Integrity'}
            </button>

            <button
              onClick={handleDownloadCertificate}
              disabled={downloadingCert}
              className="btn btn-outline"
              title="Download signed PDF integrity certificate"
            >
              <FileText size={16} className={downloadingCert ? 'animate-spin' : ''} />
              {downloadingCert ? 'Generating Certificate...' : 'Integrity Certificate PDF'}
            </button>

            <button
              onClick={handleDownloadFile}
              disabled={downloadingFile}
              className="btn btn-outline"
              title="Download raw forensic evidentiary file"
            >
              <Download size={16} className={downloadingFile ? 'animate-spin' : ''} />
              {downloadingFile ? 'Downloading File...' : 'Download File'}
            </button>

            {!isJudge && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="btn btn-outline"
              >
                <Share2 size={16} />
                Transfer Custody
              </button>
            )}

            <button onClick={handleViewSummary} className="btn btn-outline" title="Smart forensic summary">
              <Sparkles size={16} />
              Summary
            </button>
          </div>
        </div>
      </div>

      {/* SECTION B: Integrity Verification Alert Card */}
      {verifyResult && (
        <div style={{
          padding: '20px 24px',
          borderRadius: '10px',
          backgroundColor: verifyResult.verified ? '#F0FDF4' : '#FEF2F2',
          border: verifyResult.verified ? '1px solid #BBF7D0' : '1px solid #FECACA',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            {verifyResult.verified ? (
              <ShieldCheck size={28} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <ShieldAlert size={28} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: verifyResult.verified ? '#16A34A' : '#DC2626'
              }}>
                {verifyResult.verified ? 'Integrity Verified' : 'Integrity Verification Failed'}
              </div>
              <p style={{
                fontSize: '0.88rem',
                color: verifyResult.verified ? '#15803D' : '#991B1B',
                marginTop: '4px',
                lineHeight: 1.5
              }}>
                {verifyResult.verified
                  ? 'The computed SHA-256 hash matches the stored reference hash. The file content has not changed relative to the trusted reference.'
                  : 'The computed SHA-256 hash does not match the stored reference hash. The evidence requires immediate investigation.'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: '8px',
                marginTop: '12px',
                fontSize: '0.82rem'
              }}>
                <span style={{ fontWeight: 600, color: '#64748B' }}>Expected Reference Hash:</span>
                <span className="hash-pill" style={{ fontSize: '0.75rem' }}>{verifyResult.expectedHash}</span>

                <span style={{ fontWeight: 600, color: '#64748B' }}>Computed Hash on Disk:</span>
                <span className="hash-pill" style={{
                  fontSize: '0.75rem',
                  borderColor: verifyResult.verified ? '#BBF7D0' : '#FECACA',
                  backgroundColor: verifyResult.verified ? '#F0FDF4' : '#FEF2F2',
                  color: verifyResult.verified ? '#16A34A' : '#DC2626'
                }}>
                  {verifyResult.actualHash}
                </span>

                <span style={{ fontWeight: 600, color: '#64748B' }}>Verified By:</span>
                <span style={{ color: '#0F172A' }}>{verifyResult.verifiedBy} at {new Date(verifyResult.verifiedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Sections A, B, C */}
      <div className="grid-2" style={{ gap: '24px', marginBottom: '28px' }}>
        {/* SECTION A: Evidence Information */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#2563EB" />
            Section A: Evidence Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', fontSize: '0.875rem' }}>
            <span style={{ color: '#64748B', fontWeight: 600 }}>File Name:</span>
            <span style={{ fontWeight: 600, color: '#0F172A' }}>{evidence.fileName}</span>

            <span style={{ color: '#64748B', fontWeight: 600 }}>Case Identifier:</span>
            <span style={{ fontWeight: 700, color: '#2563EB' }}>{evidence.caseNumber}</span>

            <span style={{ color: '#64748B', fontWeight: 600 }}>File Size & Type:</span>
            <span style={{ color: '#334155' }}>
              {(evidence.fileSize / 1024).toFixed(1)} KB • {evidence.fileType}
            </span>

            <span style={{ color: '#64748B', fontWeight: 600 }}>Seized By:</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>
              {evidence.investigatorName || evidence.investigatorId}
            </span>

            <span style={{ color: '#64748B', fontWeight: 600 }}>Upload Date:</span>
            <span style={{ color: '#334155' }}>
              {evidence.uploadedAt ? new Date(evidence.uploadedAt).toLocaleString() : 'N/A'}
            </span>

            <span style={{ color: '#64748B', fontWeight: 600 }}>Seizure Location:</span>
            <span style={{ color: '#334155' }}>
              {evidence.location || 'Central Infrastructure Vault'}
            </span>

            <span style={{ color: '#64748B', fontWeight: 600 }}>Current Custodian:</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>
              {evidence.currentOwnerName || 'Police Custody'}
            </span>

            <span style={{ color: '#64748B', fontWeight: 600 }}>Description:</span>
            <span style={{ color: '#64748B', lineHeight: 1.5 }}>
              {evidence.description || 'No additional forensic narrative provided.'}
            </span>
          </div>
        </div>

        {/* SECTION B & C: Integrity Fingerprint & Blockchain Record */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* SECTION B: SHA-256 Fingerprint */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#16A34A" />
              Section B: Cryptographic SHA-256 Digest
            </h2>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '6px' }}>
                Immutable Reference SHA-256 Fingerprint:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="hash-pill" style={{ flex: 1, fontSize: '0.8rem', padding: '8px 12px' }}>
                  {evidence.fileHash}
                </span>
                <button
                  onClick={() => copyToClipboard(evidence.fileHash)}
                  className="btn btn-outline btn-sm"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Integrity Assessment: </span>
                <strong style={{ color: evidence.tampered ? '#DC2626' : '#16A34A', fontSize: '0.85rem' }}>
                  {evidence.tampered ? 'TAMPERED (Hash Discrepancy)' : 'VERIFIED (Match)'}
                </strong>
              </div>

              <button
                onClick={handleVerify}
                disabled={verifying}
                className="btn btn-primary btn-sm"
              >
                <ShieldCheck size={14} />
                {verifying ? 'Verifying...' : 'Verify Now'}
              </button>
            </div>
          </div>

          {/* SECTION C: Blockchain Record */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Boxes size={18} color="#0284C7" />
              Section C: Blockchain Ledger Record
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Ledger Index:</span>
              <span style={{ fontWeight: 800, color: '#0284C7' }}>Block #{evidence.blockIndex}</span>

              <span style={{ color: '#64748B', fontWeight: 600 }}>Block Hash:</span>
              <span className="hash-pill" style={{ fontSize: '0.72rem' }}>
                {evidence.blockHash || 'Computing...'}
              </span>

              <span style={{ color: '#64748B', fontWeight: 600 }}>Ledger Status:</span>
              <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                Anchored to Chain Continuity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION D: Chain of Custody Timeline */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#2563EB" />
              Section D: Chain of Custody History
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Statutory timeline tracking every physical and digital action on this evidence artifact
            </div>
          </div>

          {!isJudge && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="btn btn-outline btn-sm"
            >
              <Share2 size={14} />
              Transfer to Custodian
            </button>
          )}
        </div>

        {custodyLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
            No custody history recorded yet.
          </div>
        ) : (
          <div className="timeline">
            {custodyLogs.map((log) => (
              <div key={log.id} className="timeline-item">
                <div className={`timeline-dot ${
                  log.action === 'VERIFY' ? 'verified' :
                  log.action === 'TAMPER_SIMULATION' ? 'tampered' :
                  log.action === 'TRANSFER' ? 'warning' : ''
                }`} />

                <div style={{
                  padding: '14px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge ${
                        log.action === 'UPLOAD' ? 'badge-info' :
                        log.action === 'VERIFY' ? 'badge-verified' :
                        log.action === 'TRANSFER' ? 'badge-warning' :
                        log.action === 'TAMPER_SIMULATION' ? 'badge-tampered' : 'badge-neutral'
                      }`} style={{ fontSize: '0.68rem' }}>
                        {log.action}
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>
                        {log.username} ({log.userRole})
                      </strong>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                      {log.note || 'Action recorded in chain of custody.'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748B' }}>
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div style={{ color: '#94A3B8' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer Custody Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Transfer Evidence Custody
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Assign evidentiary custody to an authorized officer or judge. A statutory custody log entry will be created.
            </p>

            <form onSubmit={handleTransferSubmit}>
              <div className="form-group">
                <label className="form-label">Recipient User / Role</label>
                <select
                  className="form-select"
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                >
                  <option value="judge">judge (Judge — Judicial Chamber)</option>
                  <option value="police">police (Police Officer — Forensics)</option>
                  <option value="admin">admin (System Administrator)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Note / Reason</label>
                <textarea
                  className="form-textarea"
                  required
                  rows="3"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="e.g. Transferred for formal courtroom submission and judicial review"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="btn btn-primary"
                >
                  {transferring ? 'Transferring...' : 'Confirm Custody Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forensic Summary Modal */}
      {showSummaryModal && summaryData && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '680px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Forensic Artifact Summary
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
              Automated extraction of indicators of compromise (IOCs) from evidence file: <strong>{evidence.fileName}</strong>
            </p>

            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Key Entities & Observations:</strong>
                <p style={{ color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                  {summaryData.summary?.executiveSummary || 'No natural language summary available.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: '#64748B' }}>Word Count:</span>
                <span>{summaryData.summary?.wordCount || '—'}</span>

                <span style={{ fontWeight: 600, color: '#64748B' }}>IOCs Detected:</span>
                <span>{(summaryData.summary?.extractedIndicators || []).join(', ') || 'None flagged'}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSummaryModal(false)}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              Close Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
