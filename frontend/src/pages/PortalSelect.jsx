import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Scale, Settings, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PortalSelect() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#F8FAFC'
    }}>
      {/* Header */}
      <header style={{
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB'
          }}>
            <Shield size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Evidence<span style={{ color: '#2563EB' }}>Chain</span>
          </span>
        </div>

        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748B',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Select Access Portal
          </h1>
          <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '8px' }}>
            Choose your designated operational role to proceed to the secure sign-in terminal.
          </p>
        </div>

        {/* 3 Portal Cards */}
        <div className="grid-3" style={{ width: '100%', gap: '24px' }}>
          {/* Police Portal */}
          <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '36px 28px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                margin: '0 auto 20px auto'
              }}>
                <Shield size={30} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                Police Portal
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '28px' }}>
                Manage evidence, verify integrity, and track custody records.
              </p>
            </div>

            <Link to="/login/police" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Police Login
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Judge Portal */}
          <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '36px 28px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                backgroundColor: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A',
                margin: '0 auto 20px auto'
              }}>
                <Scale size={30} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                Judge Portal
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '28px' }}>
                Review evidence, verify integrity, and access custody records and certificates.
              </p>
            </div>

            <Link to="/login/judge" className="btn btn-outline" style={{
              width: '100%',
              padding: '12px',
              borderColor: '#16A34A',
              color: '#16A34A'
            }}>
              Judge Login
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Admin Portal */}
          <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '36px 28px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                margin: '0 auto 20px auto'
              }}>
                <Settings size={30} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                Admin Portal
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '28px' }}>
                Manage users, review security alerts, and access system administration tools.
              </p>
            </div>

            <Link to="/login/admin" className="btn btn-outline" style={{ width: '100%', padding: '12px' }}>
              Admin Login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Academic Note */}
        <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>
          EvidenceChain — Digital Evidence Integrity and Chain of Custody System
        </div>
      </main>
    </div>
  );
}
