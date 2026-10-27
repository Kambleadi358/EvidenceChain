import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ledgerService } from '../services/ledgerService';
import {
  Boxes,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Hash,
  Clock,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link2,
  Network
} from 'lucide-react';

export default function LedgerExplorer() {
  const [blocks, setBlocks] = useState([]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState(null);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const [blocksData, validationData] = await Promise.all([
        ledgerService.getBlocks(),
        ledgerService.validateChain()
      ]);
      setBlocks(blocksData);
      setValidation(validationData);
    } catch (err) {
      console.error('Failed to load blockchain ledger', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleValidateNow = async () => {
    try {
      setValidating(true);
      const result = await ledgerService.validateChain();
      setValidation(result);
    } catch (err) {
      alert('Validation error: ' + (err.response?.data?.message || err.message));
    } finally {
      setValidating(false);
    }
  };

  const toggleExpand = (index) => {
    setExpandedBlockIndex(expandedBlockIndex === index ? null : index);
  };

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Blockchain Ledger & Custody
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Immutable hash-linked ledger blocks preserving evidence fingerprints and parent hashes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/ledger/nodes" className="btn btn-outline btn-sm">
            <Network size={14} />
            Network Nodes
          </Link>
          <button
            onClick={handleValidateNow}
            disabled={validating}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={14} className={validating ? 'animate-spin' : ''} />
            {validating ? 'Validating Nodes...' : 'Validate Chain Continuity'}
          </button>
        </div>
      </div>

      {/* Global Chain Integrity Status Banner */}
      {validation && (
        <div style={{
          padding: '20px 24px',
          borderRadius: '10px',
          backgroundColor: validation.valid ? '#F0FDF4' : '#FEF2F2',
          border: validation.valid ? '1px solid #BBF7D0' : '1px solid #FECACA',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {validation.valid ? (
              <ShieldCheck size={36} color="#16A34A" />
            ) : (
              <ShieldAlert size={36} color="#DC2626" />
            )}
            <div>
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: validation.valid ? '#16A34A' : '#DC2626'
              }}>
                {validation.valid ? 'BLOCKCHAIN STATUS: 100% INTACT & VALID' : 'CRITICAL LEDGER MISMATCH DETECTED'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                {validation.reason || 'All consecutive SHA-256 parent hash links verified successfully.'}
              </div>
              {validation.brokenBlockIndex != null && (
                <div style={{ fontSize: '0.82rem', color: '#DC2626', marginTop: '4px', fontWeight: 700 }}>
                  Broken Link Point: Block #{validation.brokenBlockIndex}
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Total Blocks Minted</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{blocks.length}</div>
          </div>
        </div>
      )}

      {/* Blocks Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
          Minted Ledger Blocks
        </h2>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Block #</th>
                <th>Evidence Ref</th>
                <th>Minted By</th>
                <th>Minted Timestamp</th>
                <th>Block Digest</th>
                <th>Link Status</th>
                <th style={{ textAlign: 'right' }}>Hash Details</th>
              </tr>
            </thead>
            <tbody>
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No blockchain blocks minted yet.
                  </td>
                </tr>
              ) : (
                blocks.map((b) => {
                  const isExpanded = expandedBlockIndex === b.blockIndex;
                  return (
                    <React.Fragment key={b.id || b.blockIndex}>
                      <tr>
                        <td style={{ fontWeight: 800, color: '#2563EB', fontSize: '0.9rem' }}>
                          #{b.blockIndex}
                        </td>
                        <td style={{ fontWeight: 600, color: '#0F172A' }}>
                          Evidence #{b.evidenceId}
                        </td>
                        <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                          {b.minedBy || 'system'}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {b.timestamp ? new Date(b.timestamp).toLocaleString() : 'Genesis'}
                        </td>
                        <td>
                          <span className="hash-pill" style={{ fontSize: '0.72rem' }}>
                            {b.blockHash ? `${b.blockHash.slice(0, 16)}...` : '0x000'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
                            <CheckCircle2 size={12} />
                            LINKED
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => toggleExpand(b.blockIndex)}
                            className="btn btn-outline btn-sm"
                            style={{ gap: '4px' }}
                          >
                            {isExpanded ? 'Hide' : 'Expand'}
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Hash Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ backgroundColor: '#F8FAFC', padding: '16px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px', fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: 600, color: '#64748B' }}>Full Block Hash:</span>
                              <span className="hash-pill">{b.blockHash}</span>

                              <span style={{ fontWeight: 600, color: '#64748B' }}>Previous Block Hash:</span>
                              <span className="hash-pill">{b.previousHash || '00000000000000000000000000000000 (GENESIS)'}</span>

                              <span style={{ fontWeight: 600, color: '#64748B' }}>File Reference Hash:</span>
                              <span className="hash-pill">{b.fileHash}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
