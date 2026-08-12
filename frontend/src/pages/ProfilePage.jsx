import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { User as UserIcon, Lock, ShieldAlert, Check } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  const [pwData, setPwData] = useState({ current_password: '', new_password: '' });
  const [pwMsg, setPwMsg] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/users/me', { name, phone });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setProfileMsg('Profile details saved successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await API.put('/users/me/password', pwData);
      setPwMsg('Password updated successfully!');
      setPwData({ current_password: '', new_password: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Password change failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("WARNING: This will permanently delete your account and all financial records. Continue?")) {
      try {
        await API.delete('/users/me');
        logout();
      } catch (err) { alert("Failed to delete account"); }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">User Profile & Settings</h1>
      <p className="page-subtitle">Manage account credentials, personal information, and security preferences.</p>

      <div className="grid-2">
        {/* Profile Info Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={20} color="var(--accent-primary)" /> Personal Details
          </h3>
          {profileMsg && <p style={{ color: 'var(--accent-success)', marginBottom: '1rem', fontSize: '0.85rem' }}>{profileMsg}</p>}
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input type="text" disabled value={user?.email || ''} className="form-control" style={{ opacity: 0.7 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" required className="form-control"
                value={name} onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" className="form-control"
                value={phone} onChange={e => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="var(--accent-primary)" /> Security & Password
          </h3>
          {pwMsg && <p style={{ color: 'var(--accent-success)', marginBottom: '1rem', fontSize: '0.85rem' }}>{pwMsg}</p>}
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input 
                type="password" required className="form-control"
                value={pwData.current_password} onChange={e => setPwData({...pwData, current_password: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" required minLength={6} className="form-control"
                value={pwData.new_password} onChange={e => setPwData({...pwData, new_password: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-secondary">Update Password</button>
          </form>

          <hr style={{ border: 'none', borderTop: 'var(--glass-border)', margin: '2rem 0' }} />

          <div>
            <h4 style={{ color: 'var(--accent-danger)', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} /> Danger Zone
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Once deleted, all your income, expense logs, and budget history cannot be recovered.
            </p>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
