import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Target, Trash2, CheckCircle, DollarSign } from 'lucide-react';

const SavingsPage = () => {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    saved_amount: 0,
    target_date: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0]
  });

  const fetchGoals = async () => {
    try {
      const res = await API.get('/savings/');
      setGoals(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/savings/', formData);
      setShowModal(false);
      setFormData({ goal_name: '', target_amount: '', saved_amount: 0, target_date: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0] });
      fetchGoals();
    } catch (err) { alert("Error creating savings goal"); }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      const newSaved = selectedGoal.saved_amount + parseFloat(depositAmount);
      await API.put(`/savings/${selectedGoal.id}`, { saved_amount: newSaved });
      setShowDepositModal(false);
      setDepositAmount('');
      fetchGoals();
    } catch (err) { alert("Error updating goal savings"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this savings goal?")) {
      try {
        await API.delete(`/savings/${id}`);
        fetchGoals();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Define target milestones and track your wealth accumulation.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Savings Goal
        </button>
      </div>

      <div className="grid-3">
        {goals.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No savings goals created yet. Set your first financial milestone today!</p>
          </div>
        ) : (
          goals.map(g => {
            const isCompleted = g.saved_amount >= g.target_amount;
            return (
              <div key={g.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                        <Target size={20} />
                      </div>
                      <h3 style={{ fontSize: '1.1rem' }}>{g.goal_name}</h3>
                    </div>
                    <button onClick={() => handleDelete(g.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Saved: ${g.saved_amount.toFixed(2)}</span>
                    <span style={{ fontWeight: 600 }}>Target: ${g.target_amount.toFixed(2)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px',
                    overflow: 'hidden', marginBottom: '1rem'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${g.progress_percentage}%`,
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      borderRadius: '5px', transition: 'width 0.5s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Target Date: {new Date(g.target_date).toLocaleDateString()}</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{g.progress_percentage}%</span>
                  </div>
                </div>

                {isCompleted ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '0.5rem', color: 'var(--accent-success)', fontWeight: 600, padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                    <CheckCircle size={18} /> Goal Achieved!
                  </div>
                ) : (
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setSelectedGoal(g); setShowDepositModal(true); }}>
                    <DollarSign size={16} /> Add Contribution
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Goal Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem' }}>Create Savings Goal</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input 
                  type="text" required placeholder="e.g. Emergency Fund, Vacation" className="form-control"
                  value={formData.goal_name} onChange={e => setFormData({...formData, goal_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount ($)</label>
                <input 
                  type="number" step="0.01" required className="form-control"
                  value={formData.target_amount} onChange={e => setFormData({...formData, target_amount: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Saved Amount ($)</label>
                <input 
                  type="number" step="0.01" className="form-control"
                  value={formData.saved_amount} onChange={e => setFormData({...formData, saved_amount: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input 
                  type="date" required className="form-control"
                  value={formData.target_date} onChange={e => setFormData({...formData, target_date: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedGoal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>Contribute to '{selectedGoal.goal_name}'</h3>
            <form onSubmit={handleDepositSubmit}>
              <div className="form-group">
                <label className="form-label">Deposit Amount ($)</label>
                <input 
                  type="number" step="0.01" required className="form-control"
                  value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDepositModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsPage;
