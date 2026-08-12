import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Download, FileSpreadsheet, FileText, Bot, Sparkles } from 'lucide-react';

const ReportsPage = () => {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const res = await API.get('/analytics/ai-insights');
        setAiData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAI();
  }, []);

  const handleDownload = (type) => {
    window.open(`/api/v1/analytics/export/${type}`, '_blank');
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Financial Reports & AI Analytics</h1>
      <p className="page-subtitle">Generate official financial statements and explore smart spending predictions.</p>

      {/* Export Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ padding: '0.75rem', width: 'fit-content', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', color: 'var(--accent-danger)', marginBottom: '1rem' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>PDF Summary Report</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Download a cleanly formatted document containing financial overview tables and transaction logs.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => handleDownload('pdf')} style={{ justifyContent: 'center' }}>
            <Download size={18} /> Download PDF
          </button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ padding: '0.75rem', width: 'fit-content', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: 'var(--accent-success)', marginBottom: '1rem' }}>
              <FileSpreadsheet size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Excel Spreadsheet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Export detailed workbook sheets for Income and Expense datasets compatible with Microsoft Excel.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => handleDownload('excel')} style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Download size={18} /> Export Excel (.xlsx)
          </button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ padding: '0.75rem', width: 'fit-content', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '12px', color: 'var(--accent-info)', marginBottom: '1rem' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>CSV Data Stream</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Raw comma-separated data dump for custom analysis and accounting tool ingestion.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => handleDownload('csv')} style={{ justifyContent: 'center' }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>AI Spending Forecast & Advisor</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automated financial intelligence algorithm</span>
          </div>
        </div>

        {loading ? (
          <p>Analyzing historical patterns...</p>
        ) : (
          <div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} /> End-of-Month Expenditure Projection
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{aiData?.spending_forecast}</p>
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Smart Savings Recommendations:</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {aiData?.recommendations?.map((rec, idx) => (
                <li key={idx} style={{ padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: 'var(--glass-border)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
