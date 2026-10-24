import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';

export default function UploadEvidence() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [caseNumber, setCaseNumber] = useState('CASE-2026-CY88');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Municipal Datacenter, Server Room 3');
  const [collectionTimestamp, setCollectionTimestamp] = useState(
    new Date(Date.now() - 3600000).toISOString().slice(0, 16)
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleQuickPreset = (presetType) => {
    if (presetType === 'log') {
      const blob = new Blob([
        "2026-10-18 14:22:01 [CRITICAL] Root privilege escalation exploit payload executed from IP 198.51.100.77.\n2026-10-18 14:22:04 [ALERT] Unauthorized shadow admin created."
      ], { type: 'text/plain' });
      const f = new File([blob], "server_auth_breach.log", { type: 'text/plain' });
      setFile(f);
      setCaseNumber('CASE-2026-CY88');
      setTitle('Server Privilege Escalation Log');
      setDescription('Extracted system security audit log demonstrating unauthorized shadow account creation');
      setLocation('Datacenter Core Node 4, Chicago');
    } else if (presetType === 'email') {
      const blob = new Blob([
        "From: ceo-wire-transfer@spoofed-domain.com\nTo: finance@victimcorp.com\nSubject: URGENT: Execute Treasury Wire Transfer\nDate: Sun, 18 Oct 2026 12:00:00 +0000\n\nPlease transfer $450,000 immediately to offshore account."
      ], { type: 'message/rfc822' });
      const f = new File([blob], "ceo_spoof_fraud.eml", { type: 'message/rfc822' });
      setFile(f);
      setCaseNumber('CASE-2026-CY42');
      setTitle('Executive Impersonation Phishing Email');
      setDescription('Spear phishing email artifact targeting corporate treasury department');
      setLocation('Corporate Mail Gateway Exchange, New York');
    } else if (presetType === 'pcap') {
      const blob = new Blob([
        "Wireshark Network Capture TCP Syn Flood and C2 Beaconing to IP 203.0.113.88 port 443"
      ], { type: 'application/vnd.tcpdump.pcap' });
      const f = new File([blob], "c2_beacon_traffic.pcap", { type: 'application/vnd.tcpdump.pcap' });
      setFile(f);
      setCaseNumber('CASE-2026-CY19');
      setTitle('Command & Control Beacon Network Capture');
      setDescription('High-frequency packet dump capturing covert TLS beaconing');
      setLocation('Perimeter Firewall Tap #2, San Jose');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an evidentiary file to upload.');
      return;
    }
    if (!caseNumber.trim() || !title.trim() || !location.trim()) {
      setError('Case Number, Evidence Title, and Collection Location are required.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseNumber', caseNumber.trim());
    formData.append('title', title.trim());
    formData.append('description', description);
    formData.append('location', location.trim());
    formData.append('collectionTimestamp', new Date(collectionTimestamp).toISOString());

    try {
      const res = await evidenceService.upload(formData);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Evidence upload and blockchain minting failed.');
    } finally {
      setUploading(false);
    }
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="page-body">
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link to="/evidence" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.85rem', marginBottom: '16px' }}>
          <ArrowLeft size={16} />
          Back to Evidence Records
        </Link>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Upload Digital Evidence
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Register digital forensic evidence, compute SHA-256 fingerprint, and mint blockchain block.
          </p>
        </div>

        {/* Quick Sample Selector */}
        {!result && (
          <div className="card" style={{ marginBottom: '24px', padding: '16px 20px', backgroundColor: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                <Sparkles size={16} color="#2563EB" />
                Auto-Fill Sample Forensics Artifacts:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => handleQuickPreset('log')} className="btn btn-outline btn-sm">
                  Server Log (.log)
                </button>
                <button type="button" onClick={() => handleQuickPreset('email')} className="btn btn-outline btn-sm">
                  Phishing Email (.eml)
                </button>
                <button type="button" onClick={() => handleQuickPreset('pcap')} className="btn btn-outline btn-sm">
                  Traffic Capture (.pcap)
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error)',
            marginBottom: '20px',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}

        {/* Success Screen */}
        {result ? (
          <div className="card" style={{ border: '2px solid #16A34A', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  Evidence Successfully Registered & Minted!
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 600 }}>
                  Blockchain Ledger Block #{result.blockIndex} created
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: '10px',
                fontSize: '0.88rem',
                padding: '16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Evidence Name:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{result.fileName}</span>

                <span style={{ color: '#64748B', fontWeight: 600 }}>Case Identifier:</span>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>{result.caseNumber}</span>

                <span style={{ color: '#64748B', fontWeight: 600 }}>Title:</span>
                <span style={{ color: '#334155' }}>{result.title}</span>

                <span style={{ color: '#64748B', fontWeight: 600 }}>Ledger Record:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Block #{result.blockIndex}</span>

                <span style={{ color: '#64748B', fontWeight: 600 }}>Integrity Status:</span>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>VERIFIED (Reference Stored)</span>

                <span style={{ color: '#64748B', fontWeight: 600 }}>SHA-256 Digest:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="hash-pill" style={{ fontSize: '0.78rem' }}>
                    {result.fileHash}
                  </span>
                  <button
                    onClick={() => copyHash(result.fileHash)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px' }}
                    title="Copy SHA-256 Digest"
                  >
                    {copiedHash ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to={`/evidence/${result.id}`} className="btn btn-primary">
                View Evidence Record
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => { setResult(null); setFile(null); setTitle(''); setDescription(''); }}
                className="btn btn-outline"
              >
                Upload Another Item
              </button>
              <Link to="/evidence" className="btn btn-outline">
                Back to Evidence List
              </Link>
            </div>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
            <div className="form-group">
              <label className="form-label">Evidence File *</label>
              <input
                type="file"
                required
                className="form-input"
                onChange={(e) => {
                  const selected = e.target.files[0];
                  setFile(selected);
                  if (selected && !title) {
                    setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
                  }
                }}
              />
              {file && (
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                  Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Case Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. CASE-2026-CY88"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Evidence Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Firewall Access Logs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Collection Location *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Server Room B, Rack 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Collection Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={collectionTimestamp}
                  onChange={(e) => setCollectionTimestamp(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Forensic Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Enter investigative details, chain notes, or seizure circumstances..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
              >
                {uploading ? 'Hashing & Minting to Ledger...' : 'Upload & Mint Evidence'}
                {!uploading && <ArrowRight size={16} />}
              </button>
              <Link to="/evidence" className="btn btn-outline" style={{ padding: '12px 20px' }}>
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
