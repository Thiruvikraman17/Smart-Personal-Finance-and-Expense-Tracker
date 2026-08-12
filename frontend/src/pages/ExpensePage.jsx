import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Search, Filter, Trash2, Edit, Camera, Upload } from 'lucide-react';

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [scanning, setScanning] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    payment_method: 'Credit Card',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = async () => {
    try {
      const res = await API.get('/expenses/', {
        params: { search, category: categoryFilter }
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, pmRes] = await Promise.all([
          API.get('/expenses/categories'),
          API.get('/expenses/payment-methods')
        ]);
        setCategories(catRes.data);
        setPaymentMethods(pmRes.data);
      } catch (err) { console.error(err); }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [search, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/expenses/${editId}`, formData);
      } else {
        await API.post('/expenses/', formData);
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ amount: '', category: 'Food', payment_method: 'Credit Card', description: '', transaction_date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.detail || "Error saving expense");
    }
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    try {
      const res = await API.post('/expenses/scan-receipt', bodyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      setFormData({
        amount: data.amount,
        category: data.category,
        payment_method: data.payment_method,
        description: data.description,
        transaction_date: new Date().toISOString().split('T')[0]
      });
      setScanning(false);
      setShowScanModal(false);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setScanning(false);
      alert("Receipt scanning failed");
    }
  };

  const handleEdit = (exp) => {
    setEditId(exp.id);
    setFormData({
      amount: exp.amount,
      category: exp.category,
      payment_method: exp.payment_method,
      description: exp.description || '',
      transaction_date: new Date(exp.transaction_date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense entry?")) {
      try {
        await API.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Expense Tracker</h1>
          <p className="page-subtitle">Monitor outflows, payment channels, and scan receipts using AI.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowScanModal(true)}>
            <Camera size={18} /> Scan Receipt AI
          </button>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setShowModal(true); }}>
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search expense descriptions..." 
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

      {/* Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Description</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No expense records found.</td></tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{new Date(exp.transaction_date).toLocaleDateString()}</td>
                    <td><span className="badge badge-warning">{exp.category}</span></td>
                    <td><span className="badge badge-info">{exp.payment_method}</span></td>
                    <td>{exp.description || '-'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>-${exp.amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleEdit(exp)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '0.75rem' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
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

      {/* OCR Modal */}
      {showScanModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>AI Receipt Scanner</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Upload a clear image of your receipt. Our AI will automatically extract the total, category, merchant, and payment method.
            </p>
            {scanning ? (
              <p style={{ padding: '2rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Analyzing receipt items with OCR...</p>
            ) : (
              <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <Upload size={18} /> Choose File
                <input type="file" accept="image/*" onChange={handleReceiptUpload} style={{ display: 'none' }} />
              </label>
            )}
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowScanModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Expense' : 'Add Expense'}</h3>
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
                <label className="form-label">Payment Method</label>
                <select 
                  className="form-control"
                  value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}
                >
                  {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
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
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensePage;
