import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  Boxes,
  ShieldCheck,
  Bell,
  Users,
  AlertTriangle,
  FileText,
  Wrench,
  LogOut,
  Shield,
  Scale,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const role = user?.role || 'POLICE';

  const handleLogout = () => {
    authService.logout();
    navigate('/portal');
  };

  // Role-specific navigation menus
  let navItems = [];
  let roleTitle = 'Police Officer';
  let RoleIcon = Shield;
  let homeRoute = '/police/dashboard';

  if (role === 'JUDGE') {
    roleTitle = 'Judge';
    RoleIcon = Scale;
    homeRoute = '/judge/dashboard';
    navItems = [
      { to: '/judge/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/evidence', label: 'Evidence Records', icon: <FileCheck2 size={18} /> },
      { to: '/custody', label: 'Verification', icon: <ShieldCheck size={18} /> },
      { to: '/ledger', label: 'Custody & Ledger', icon: <Boxes size={18} /> },
      { to: '/certificates', label: 'Certificates', icon: <FileText size={18} /> },
    ];
  } else if (role === 'ADMIN') {
    roleTitle = 'System Administrator';
    RoleIcon = Settings;
    homeRoute = '/admin/dashboard';
    navItems = [
      { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/admin/users', label: 'User Management', icon: <Users size={18} /> },
      { to: '/admin/alerts', label: 'Security Alerts', icon: <AlertTriangle size={18} /> },
      { to: '/admin/audit', label: 'Audit Reports', icon: <FileText size={18} /> },
      { to: '/admin/tools', label: 'Demo Tools', icon: <Wrench size={18} /> },
    ];
  } else {
    // POLICE (default)
    roleTitle = 'Police Officer';
    RoleIcon = Shield;
    homeRoute = '/police/dashboard';
    navItems = [
      { to: '/police/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/evidence', label: 'Evidence', icon: <FileCheck2 size={18} /> },
      { to: '/evidence/upload', label: 'Upload Evidence', icon: <UploadCloud size={18} /> },
      { to: '/custody', label: 'Verification', icon: <ShieldCheck size={18} /> },
      { to: '/ledger', label: 'Custody Records', icon: <Boxes size={18} /> },
      { to: '/alerts', label: 'Notifications', icon: <Bell size={18} /> },
    ];
  }

  return (
    <aside className="sidebar">
      {/* Top Sidebar Header */}
      <div style={{
        padding: '20px 22px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
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
          <RoleIcon size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
            EvidenceChain
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
            Ledger Active
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#94A3B8',
          textTransform: 'uppercase',
          padding: '6px 12px',
          letterSpacing: '0.06em'
        }}>
          {roleTitle} Menu
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === homeRoute}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              color: isActive ? '#2563EB' : '#475569',
              backgroundColor: isActive ? '#EFF6FF' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease'
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
              {roleTitle}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Role: <strong style={{ color: '#2563EB' }}>{role}</strong>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px'
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
