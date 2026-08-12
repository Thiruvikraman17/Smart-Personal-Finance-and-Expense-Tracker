import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, Bell, CheckCircle } from 'lucide-react';
import API from '../services/api';

const Header = () => {
  const { user, theme, toggleTheme } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <header style={{
      height: '70px',
      background: 'var(--bg-secondary)',
      borderBottom: 'var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Welcome back, {user?.name || 'User'} 👋</h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Dark/Light mode toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-primary)',
            border: 'var(--glass-border)',
            color: 'var(--text-primary)',
            width: '40px', height: '40px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'var(--transition)'
          }}
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              background: 'var(--bg-primary)',
              border: 'var(--glass-border)',
              color: 'var(--text-primary)',
              width: '40px', height: '40px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'var(--transition)'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                background: 'var(--accent-danger)', color: 'white',
                fontSize: '0.7rem', width: '18px', height: '18px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="glass-card" style={{
              position: 'absolute', right: 0, top: '50px', width: '320px',
              maxHeight: '380px', overflowY: 'auto', zIndex: 200, padding: '1rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                Notifications <span>({unreadCount} unread)</span>
              </h4>
              {notifications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                    background: n.status === 'unread' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-primary)',
                    marginBottom: '0.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: '0.5rem'
                  }}>
                    <span>{n.message}</span>
                    {n.status === 'unread' && (
                      <button onClick={() => markRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-success)', cursor: 'pointer' }}>
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--accent-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1rem'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
