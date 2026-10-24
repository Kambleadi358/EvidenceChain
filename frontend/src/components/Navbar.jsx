import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Shield, Scale, Settings, LogOut, ExternalLink, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/portal');
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'POLICE':
        return {
          title: 'Police Officer',
          badgeClass: 'badge-info',
          icon: <Shield size={16} color="#2563EB" />,
        };
      case 'JUDGE':
        return {
          title: 'Judge',
          badgeClass: 'badge-verified',
          icon: <Scale size={16} color="#16A34A" />,
        };
      case 'ADMIN':
        return {
          title: 'System Administrator',
          badgeClass: 'badge-neutral',
          icon: <Settings size={16} color="#475569" />,
        };
      default:
        return {
          title: 'Authorized User',
          badgeClass: 'badge-neutral',
          icon: <User size={16} />,
        };
    }
  };

  const roleMeta = getRoleDisplay(user?.role);

  return (
    <header style={{
      height: '68px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Brand Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          backgroundColor: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563EB'
        }}>
          <Shield size={20} />
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#0F172A' }}>
            Evidence<span style={{ color: '#2563EB' }}>Chain</span>
          </span>
          <span style={{
            fontSize: '0.72rem',
            color: '#64748B',
            marginLeft: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600
          }}>
            Digital Evidence & Chain of Custody
          </span>
        </div>
      </div>

      {/* Right User Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* JSP Admin Portal Link */}
        <a
          href="/admin/login"
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-outline"
          title="Open Academic JSP/Servlet Admin Portal"
          style={{ fontSize: '0.78rem', color: '#475569', gap: '6px' }}
        >
          <ExternalLink size={14} />
          JSP Admin Portal
        </a>

        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '1px solid #E2E8F0',
            paddingLeft: '18px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                {roleMeta.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '1px' }}>
                <span className={`badge ${roleMeta.badgeClass}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {user.role}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  {user.username}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline"
              style={{ padding: '8px', color: '#64748B' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
