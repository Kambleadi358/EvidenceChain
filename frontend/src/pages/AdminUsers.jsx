import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import {
  Users,
  Lock,
  Unlock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await alertService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleLock = async (user) => {
    const isLocked = user.accountLocked;
    const actionText = isLocked ? 'unlock' : 'lock';
    if (!window.confirm(`Are you sure you want to ${actionText} the account for ${user.username}?`)) {
      return;
    }

    try {
      if (isLocked) {
        await alertService.unlockUser(user.id);
        setActionMsg(`User account '${user.username}' successfully unlocked.`);
      } else {
        await alertService.lockUser(user.id);
        setActionMsg(`User account '${user.username}' successfully locked.`);
      }
      setTimeout(() => setActionMsg(null), 5000);
      await loadUsers();
    } catch (err) {
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (u.username && u.username.toLowerCase().includes(q))
      || (u.fullName && u.fullName.toLowerCase().includes(q))
      || (u.role && u.role.toLowerCase().includes(q));
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
            User Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
            Inspect system accounts, roles, and administrative lock/unlock controls.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadUsers} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href="/admin/users"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
          >
            <ExternalLink size={14} />
            JSP Users Portal
          </a>
        </div>
      </div>

      {actionMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#16A34A',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          {actionMsg}
        </div>
      )}

      {/* User Table Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem' }}
              placeholder="Search by name, username, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Total accounts: <strong>{users.length}</strong>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Agency & Dept</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Administrative Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>
                      {u.username}
                    </td>
                    <td style={{ color: '#475569' }}>
                      {u.fullName || '—'}
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'ADMIN' ? 'badge-neutral' :
                        u.role === 'JUDGE' ? 'badge-verified' : 'badge-info'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {u.agency || 'HQ'} {u.department ? `(${u.department})` : ''}
                    </td>
                    <td>
                      {u.accountLocked ? (
                        <span className="badge badge-tampered">
                          <Lock size={12} />
                          LOCKED
                        </span>
                      ) : (
                        <span className="badge badge-verified">
                          <ShieldCheck size={12} />
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role === 'ADMIN' ? (
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Protected</span>
                      ) : (
                        <button
                          onClick={() => handleToggleLock(u)}
                          className={`btn btn-sm ${u.accountLocked ? 'btn-success' : 'btn-outline'}`}
                          style={{ fontSize: '0.78rem' }}
                        >
                          {u.accountLocked ? (
                            <>
                              <Unlock size={13} />
                              Unlock Account
                            </>
                          ) : (
                            <>
                              <Lock size={13} />
                              Lock Account
                            </>
                          )}
                        </button>
                      )}
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
