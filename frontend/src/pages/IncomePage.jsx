import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Search, Filter, Trash2, Edit } from 'lucide-react';

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const fetchIncomes = async () => {
    try {
      const res = await API.get('/income/', {
        params: { search, category: categoryFilter }
      });
      setIncomes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/income/categories');
        setCategories(res.data);
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [search, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/income/${editId}`, formData);
      } else {
        await API.post('/income/', formData);
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ amount: '', category: 'Salary', description: '', transaction_date: new Date().toISOString().split('T')[0] });
      fetchIncomes();
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving income");
    }
  };

  const handleEdit = (inc) => {
    setEditId(inc.id);
    setFormData({
      amount: inc.amount,
      category: inc.category,
      description: inc.description || '',
      transaction_date: new Date(inc.transaction_date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      try {
        await API.delete(`/income/${id}`);
        fetchIncomes();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Income Management</h1>
          <p className="page-subtitle">Log, categorize, and track your revenue streams.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setShowModal(true); }}>
          <Plus size={18} /> Add Income
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search descriptions..." 
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <select 
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Income Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No income entries found.</td></tr>
              ) : (
                incomes.map(inc => (
                  <tr key={inc.id}>
                    <td>{new Date(inc.transaction_date).toLocaleDateString()}</td>
                    <td><span className="badge badge-success">{inc.category}</span></td>
                    <td>{inc.description || '-'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>+${inc.amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleEdit(inc)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '0.75rem' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(inc.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Income' : 'Add New Income'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input 
                  type="number" step="0.01" required className="form-control"
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
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
                <label className="form-label">Description</label>
                <input 
                  type="text" className="form-control"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transaction Date</label>
                <input 
                  type="date" required className="form-control"
                  value={formData.transaction_date} onChange={e => setFormData({...formData, transaction_date: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Income</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomePage;
