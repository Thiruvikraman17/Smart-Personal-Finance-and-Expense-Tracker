import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '1rem'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem'
          }}>
            S
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sign in to access your finance tracker</p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-danger)',
            borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" required className="form-control" placeholder="user@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" required className="form-control" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
