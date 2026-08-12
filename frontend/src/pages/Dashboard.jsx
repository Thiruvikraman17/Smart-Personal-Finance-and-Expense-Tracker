import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, 
  Wallet, PieChart as PieIcon, Activity 
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, ArcElement, BarElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, BarElement
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, chartRes] = await Promise.all([
          API.get('/analytics/summary'),
          API.get('/analytics/charts')
        ]);
        setSummary(sumRes.data);
        setCharts(chartRes.data);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="page-container"><p>Loading financial dashboard analytics...</p></div>;
  }

  const lineData = {
    labels: charts?.monthly_trend?.labels || [],
    datasets: [
      {
        label: 'Income ($)',
        data: charts?.monthly_trend?.income || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses ($)',
        data: charts?.monthly_trend?.expenses || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const doughnutData = {
    labels: charts?.expense_category_pie?.labels || [],
    datasets: [
      {
        data: charts?.expense_category_pie?.data || [],
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
          '#10b981', '#f59e0b', '#3b82f6', '#14b8a6'
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Financial Summary Dashboard</h1>
      <p className="page-subtitle">Real-time tracking of your wealth, income streams, and monthly expenditure.</p>

      {/* Metric Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Income</span>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: 'var(--accent-success)' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>${summary?.total_income?.toLocaleString()}</h2>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Expenses</span>
            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', color: 'var(--accent-danger)' }}>
              <ArrowDownRight size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>${summary?.total_expenses?.toLocaleString()}</h2>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Balance</span>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
              <Wallet size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: summary?.current_balance >= 0 ? 'var(--text-primary)' : 'var(--accent-danger)' }}>
            ${summary?.current_balance?.toLocaleString()}
          </h2>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Financial Health</span>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', color: 'var(--accent-warning)' }}>
              <Activity size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
            {summary?.financial_health_score}/100
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{summary?.health_score_label}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Income vs Expense Trends</h3>
          <div style={{ height: '300px' }}>
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Expense Breakdown by Category</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
