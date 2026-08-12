import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Shield, Users, Database, Ban, CheckCircle, Trash2 } from 'lucide-react';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [metRes, usrRes] = await Promise.all([
        API.get('/admin/system-metrics'),
        API.get('/admin/users')
      ]);
      setMetrics(metRes.data);
      setUsersList(usrRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await API.put(`/admin/users/${userId}/status`, null, {
        params: { is_active: !currentStatus }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Permanently delete this user account and all their records?")) {
      try {
        await API.delete(`/admin/users/${userId}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.detail || "Action failed");
      }
    }
  };

  if (user?.role !== 'admin') {
    return <div className="page-container"><h3>Access Denied. Admin privileges required.</h3></div>;
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Shield size={28} color="var(--accent-primary)" />
        <h1 className="page-title" style={{ marginBottom: 0 }}>System Admin Portal</h1>
      </div>
      <p className="page-subtitle">Platform overview, user directory controls, and database metrics.</p>

      {/* Metrics Grid */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Registered Users</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{metrics?.total_users || 0}</h2>
        </div>
        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Users</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem', color: 'var(--accent-success)' }}>{metrics?.active_users || 0}</h2>
        </div>
        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Incomes Logged</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{metrics?.total_incomes_logged || 0}</h2>
        </div>
        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Expenses Logged</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{metrics?.total_expenses_logged || 0}</h2>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>User Management Directory</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-warning'}`}>
                      {u.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {u.id !== user.id && (
                      <>
                        <button 
                          onClick={() => toggleStatus(u.id, u.is_active)}
                          style={{ background: 'none', border: 'none', color: u.is_active ? 'var(--accent-warning)' : 'var(--accent-success)', cursor: 'pointer', marginRight: '0.75rem' }}
                          title={u.is_active ? "Block User" : "Unblock User"}
                        >
                          {u.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button 
                          onClick={() => deleteUser(u.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
