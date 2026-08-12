import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      alert("Registration successful! Please login.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '1rem'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create an Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Join Smart Personal Finance Tracker</p>
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
            <label className="form-label">Full Name</label>
            <input 
              type="text" required className="form-control" placeholder="John Doe"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" required className="form-control" placeholder="user@example.com"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="text" className="form-control" placeholder="+1 234 567 890"
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" required minLength={6} className="form-control" placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" required className="form-control" placeholder="••••••••"
                value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
