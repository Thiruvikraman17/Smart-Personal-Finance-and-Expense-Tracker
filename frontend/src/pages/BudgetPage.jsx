import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const now = new Date();
  const [formData, setFormData] = useState({
    category: 'Food',
    monthly_limit: '',
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });

  const fetchBudgets = async () => {
    try {
      const res = await API.get('/budgets/', {
        params: { month: formData.month, year: formData.year }
      });
      setBudgets(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/expenses/categories');
        setCategories(res.data);
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [formData.month, formData.year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/budgets/', formData);
      setShowModal(false);
      setFormData({ ...formData, monthly_limit: '' });
      fetchBudgets();
    } catch (err) {
      alert("Error setting budget limit");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete budget allocation?")) {
      try {
        await API.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Budget Allocation & Limits</h1>
          <p className="page-subtitle">Set monthly caps per category and track utilization percentage.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Allocate Budget
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Viewing Period:</span>
        <select 
          className="form-control" style={{ width: '140px' }}
          value={formData.month} onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}
        >
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <select 
          className="form-control" style={{ width: '120px' }}
          value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
        >
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid-3">
        {budgets.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No budgets set for this month. Click "Allocate Budget" to set spending caps!</p>
          </div>
        ) : (
          budgets.map(b => {
            const isOver = b.spent > b.monthly_limit;
            const percentage = Math.min(b.utilization_percentage, 100);
            return (
              <div key={b.id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{b.category}</h3>
                  <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Spent: ${b.spent.toFixed(2)}</span>
                  <span style={{ fontWeight: 600 }}>Limit: ${b.monthly_limit.toFixed(2)}</span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px',
                  overflow: 'hidden', marginBottom: '1rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: isOver ? 'var(--accent-danger)' : (percentage > 80 ? 'var(--accent-warning)' : 'var(--accent-success)'),
                    borderRadius: '5px', transition: 'width 0.5s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  {isOver ? (
                    <>
                      <AlertTriangle size={16} color="var(--accent-danger)" />
                      <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>Overspent by ${(b.spent - b.monthly_limit).toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} color="var(--accent-success)" />
                      <span style={{ color: 'var(--text-secondary)' }}>{b.utilization_percentage}% Utilized</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem' }}>Allocate Category Budget</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-control"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Limit ($)</label>
                <input 
                  type="number" step="0.01" required className="form-control"
                  value={formData.monthly_limit} onChange={e => setFormData({...formData, monthly_limit: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
