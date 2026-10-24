import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/evidenceService';
import { authService } from '../services/authService';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, FileText, UploadCloud, RefreshCw, Eye } from 'lucide-react';

export default function EvidenceList() {
  const currentUser = authService.getCurrentUser();
  const isJudge = currentUser?.role === 'JUDGE';

  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [caseFilter, setCaseFilter] = useState('');

  const tags = ['ALL', 'LOG', 'IMAGE', 'EMAIL', 'NETWORK_CAPTURE', 'DOCUMENT'];

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const data = await evidenceService.list({
        search: searchTerm,
        tag: selectedTag === 'ALL' ? '' : selectedTag,
        caseNumber: caseFilter,
      });
      setEvidenceList(data);
    } catch (err) {
      console.error('Failed to load evidence repository', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [selectedTag, caseFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvidence();
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Evidence Records
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Multi-agency registry of hashed and blockchain-anchored digital artifacts.
          </p>
        </div>

        {!isJudge && (
          <Link to="/evidence/upload" className="btn btn-primary btn-sm">
            <UploadCloud size={16} />
            + Upload Evidence
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px' }}
              placeholder="Search by title, file name, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: '220px' }}>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%' }}
              placeholder="Filter by Case Number..."
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Search
          </button>

          <button
            type="button"
            onClick={() => { setSearchTerm(''); setCaseFilter(''); setSelectedTag('ALL'); }}
            className="btn btn-outline"
            title="Reset Filters"
          >
            <RefreshCw size={14} />
          </button>
        </form>

        {/* Tag Pills */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginRight: '4px' }}>
            CATEGORIES:
          </span>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`badge ${selectedTag === tag ? 'badge-info' : 'badge-neutral'}`}
              style={{
                cursor: 'pointer',
                borderColor: selectedTag === tag ? '#2563EB' : '#E2E8F0',
                backgroundColor: selectedTag === tag ? '#EFF6FF' : '#F8FAFC',
                padding: '4px 10px'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Evidence Title</th>
                <th>File Name & Size</th>
                <th>Category</th>
                <th>Block #</th>
                <th>Integrity Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    Loading evidence records...
                  </td>
                </tr>
              ) : evidenceList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    No matching evidence found.
                  </td>
                </tr>
              ) : (
                evidenceList.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.88rem' }}>
                      {e.caseNumber}
                    </td>
                    <td>
                      <Link to={`/evidence/${e.id}`} style={{ fontWeight: 600, color: '#0F172A' }}>
                        {e.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Seized by: {e.investigatorName || e.investigatorId}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#334155' }}>{e.fileName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        {(e.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        {e.autoTags ? e.autoTags.split(',')[0].trim() : 'FILE'}
                      </span>
                    </td>
                    <td>
                      <span className="hash-pill" style={{ fontSize: '0.72rem' }}>
                        #{e.blockIndex}
                      </span>
                    </td>
                    <td>
                      <StatusBadge isTampered={e.tampered} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <Link to={`/evidence/${e.id}`} className="btn btn-outline btn-sm">
                          {isJudge ? 'Review' : 'View Details'}
                        </Link>
                        <button
                          type="button"
                          onClick={() => evidenceService.downloadCertificate(e.id, `Evidence_Certificate_${e.caseNumber}_#${e.id}.pdf`)}
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
