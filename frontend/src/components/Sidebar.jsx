import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, TrendingUp, TrendingDown, 
  PieChart, Target, FileText, Shield, User, LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Savings Goals', path: '/savings', icon: Target },
    { name: 'Reports & AI', path: '/reports', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Portal', path: '/admin', icon: Shield });
  }

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-secondary)',
      borderRight: 'var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      transition: 'var(--transition)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
        }}>
          S
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', lineHeight: '1.1' }}>SmartFinance</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tracker & AI</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                transition: 'var(--transition)'
              })}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <button 
        onClick={logout}
        className="btn"
        style={{
          width: '100%',
          marginTop: 'auto',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--accent-danger)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          justifyContent: 'center'
        }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
