import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Shield, Scale, Settings, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { role: routeRole } = useParams(); // 'police', 'judge', 'admin' or undefined

  // Map route role to display configuration
  const roleConfig = {
    police: {
      role: 'POLICE',
      label: 'Police Sign In',
      subtitle: 'Evidence intake and custody management terminal',
      icon: <Shield size={26} color="#2563EB" />,
      iconBg: '#EFF6FF',
      defaultUser: 'police',
      defaultPass: '',
      redirect: '/police/dashboard',
    },
    judge: {
      role: 'JUDGE',
      label: 'Judge Sign In',
      subtitle: 'Judicial review and evidence integrity verification portal',
      icon: <Scale size={26} color="#16A34A" />,
      iconBg: '#F0FDF4',
      defaultUser: 'judge',
      defaultPass: '',
      redirect: '/judge/dashboard',
    },
    admin: {
      role: 'ADMIN',
      label: 'Admin Sign In',
      subtitle: 'Administrative governance and security operations',
      icon: <Settings size={26} color="#475569" />,
      iconBg: '#F1F5F9',
      defaultUser: 'admin',
      defaultPass: '',
      redirect: '/admin/dashboard',
    },
  };

  const currentConfig = roleConfig[routeRole] || roleConfig.police;

  const [username, setUsername] = useState(currentConfig.defaultUser);
  const [password, setPassword] = useState(currentConfig.defaultPass);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUsername(currentConfig.defaultUser);
    setPassword(currentConfig.defaultPass);
    setError(null);
  }, [routeRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      // Route based on authenticated user role
      if (data.role === 'JUDGE') {
        navigate('/judge/dashboard');
      } else if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/police/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#F8FAFC'
    }}>
      {/* Top Bar */}
      <header style={{
        height: '65px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB'
          }}>
            <Shield size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Evidence<span style={{ color: '#2563EB' }}>Chain</span>
          </span>
        </div>

        <Link to="/portal" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748B',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <ArrowLeft size={15} />
          Back to Portal Selector
        </Link>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Card */}
          <div className="card" style={{ padding: '36px 32px', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                backgroundColor: currentConfig.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                {currentConfig.icon}
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {currentConfig.label}
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '6px' }}>
                {currentConfig.subtitle}
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                color: 'var(--error)',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '38px' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                  <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '38px', paddingRight: '38px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '11px',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Demo Account Selector */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                Select Demo Account:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setUsername('police'); setPassword(''); }}
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '6px 4px',
                    borderColor: username === 'police' ? '#2563EB' : '#E2E8F0',
                    backgroundColor: username === 'police' ? '#EFF6FF' : '#FFFFFF'
                  }}
                >
                  police
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('judge'); setPassword(''); }}
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '6px 4px',
                    borderColor: username === 'judge' ? '#16A34A' : '#E2E8F0',
                    backgroundColor: username === 'judge' ? '#F0FDF4' : '#FFFFFF'
                  }}
                >
                  judge
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword(''); }}
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '6px 4px',
                    borderColor: username === 'admin' ? '#475569' : '#E2E8F0',
                    backgroundColor: username === 'admin' ? '#F1F5F9' : '#FFFFFF'
                  }}
                >
                  admin
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/portal" style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Switch to a different portal role
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
