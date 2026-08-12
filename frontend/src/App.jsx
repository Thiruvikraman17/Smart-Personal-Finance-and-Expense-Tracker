import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import IncomePage from './pages/IncomePage';
import ExpensePage from './pages/ExpensePage';
import BudgetPage from './pages/BudgetPage';
import SavingsPage from './pages/SavingsPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const ProtectedLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/budgets" element={<BudgetPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
