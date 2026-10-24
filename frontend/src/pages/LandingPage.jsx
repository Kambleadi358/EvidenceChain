import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileCheck2,
  Lock,
  Boxes,
  ArrowRight,
  Fingerprint,
  FileText,
  UserCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 32px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Evidence<span style={{ color: '#2563EB' }}>Chain</span>
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#64748B', cursor: 'pointer' }}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('security')}
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#64748B', cursor: 'pointer' }}
          >
            Security
          </button>
          <Link to="/portal" className="btn btn-primary btn-sm" style={{ padding: '8px 18px' }}>
            Access Portal
            <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px 24px',
        textAlign: 'center',
        maxWidth: '920px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          color: '#2563EB',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Fingerprint size={16} />
          Cryptographic Chain of Custody & Evidence Integrity
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.03em',
          lineHeight: 1.18,
          marginBottom: '20px'
        }}>
          Secure Digital Evidence. <br />
          <span style={{ color: '#2563EB' }}>Verifiable Integrity.</span>
        </h1>

        <p style={{
          fontSize: '1.125rem',
          color: '#64748B',
          lineHeight: 1.6,
          maxWidth: '720px',
          margin: '0 auto 36px auto'
        }}>
          Manage digital evidence, verify file integrity, and maintain a transparent chain of custody through cryptographic fingerprints and tamper-evident records.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/portal" className="btn btn-primary btn-lg">
            Access Portal
            <ArrowRight size={18} />
          </Link>
          <button onClick={() => scrollToSection('how-it-works')} className="btn btn-outline btn-lg">
            How It Works
          </button>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section style={{ padding: '40px 24px 70px 24px', maxWidth: '1160px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Core Platform Capabilities
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '6px' }}>
            Built for forensic investigators, judicial officers, and administrators.
          </p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ padding: '32px 28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              marginBottom: '20px'
            }}>
              <FileCheck2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              Evidence Management
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              Upload and organize digital evidence files securely. Capture vital case identifiers, timestamps, and collection metadata in structured forensic vaults.
            </p>
          </div>

          <div className="card" style={{ padding: '32px 28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A',
              marginBottom: '20px'
            }}>
              <Fingerprint size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              Integrity Verification
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              Verify evidence using SHA-256 fingerprints and stored reference records. Recalculate on-disk hashes to immediately expose physical or logical tampering.
            </p>
          </div>

          <div className="card" style={{ padding: '32px 28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#F0F9FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
              marginBottom: '20px'
            }}>
              <Boxes size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              Chain of Custody
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55 }}>
              Review evidence transfers and custody history. Every intake, verification, view, and transfer action is recorded with cryptographic timestamps and actor identities.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              How It Works
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '6px' }}>
              A straightforward four-step verification lifecycle for digital forensics.
            </p>
          </div>

          <div className="grid-4" style={{ gap: '24px' }}>
            <div style={{
              padding: '28px 20px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Upload Evidence
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Authorized officers intake evidentiary files along with verified case numbers and collection timestamps.
              </p>
            </div>

            <div style={{
              padding: '28px 20px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Generate SHA-256
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                The backend computes a deterministic 256-bit cryptographic digest representing the exact file content.
              </p>
            </div>

            <div style={{
              padding: '28px 20px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Record Ledger Block
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                The digest is anchored into a hash-linked blockchain record with the previous block hash and investigator identity.
              </p>
            </div>

            <div style={{
              padding: '28px 20px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                4
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Verify & Track
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Judges and officers verify file continuity anytime, review historical custody events, and export signed PDF certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" style={{ padding: '80px 24px', maxWidth: '1160px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Security & Integrity Architecture
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '6px' }}>
            Rigorous cryptographic principles enforcing forensic admissibility.
          </p>
        </div>

        <div className="grid-2" style={{ gap: '24px' }}>
          <div className="card" style={{ display: 'flex', gap: '18px', padding: '24px' }}>
            <div style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                SHA-256 Integrity Checks
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Every verification operation recalculates the exact file hash and compares it directly against the immutable reference hash created at intake. Any single-byte modification produces an immediate verification failure.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '18px', padding: '24px' }}>
            <div style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Hash-Linked Ledger Records
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Each minted block stores the hash of its parent block, forming a tamper-evident blockchain ledger. If any historical block is altered, subsequent hash links become invalid.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '18px', padding: '24px' }}>
            <div style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Role-Based Access Control
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Strict server-side authorization isolates responsibilities across Police, Judge, and Admin roles. Judges cannot tamper with or upload files; Police cannot manage user privileges.
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '18px', padding: '24px' }}>
            <div style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Immutable Custody History
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Every action taken on an evidentiary item — upload, view, verification, download, or transfer — is logged permanently with actor IDs, IP origin, action type, and timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 24px',
        backgroundColor: '#EFF6FF',
        borderTop: '1px solid #DBEAFE',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
            Ready to Access the System?
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '24px' }}>
            Select your assigned portal to proceed with authorized evidence management, judicial review, or system administration.
          </p>
          <Link to="/portal" className="btn btn-primary btn-lg">
            Open Portal Selector
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '36px 32px'
      }}>
        <div style={{
          maxWidth: '1160px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Evidence<span style={{ color: '#2563EB' }}>Chain</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
              Digital Evidence Integrity & Chain of Custody System
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
              Academic Demonstration Project — Digital Forensics & Web Technologies
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
            <Link to="/portal" style={{ color: '#64748B' }}>Access Portal</Link>
            <a href="/admin/login" target="_blank" rel="noreferrer" style={{ color: '#64748B' }}>
              JSP Admin Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
