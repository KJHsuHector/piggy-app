import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export const HomeDashboard = () => {
  const { transactions, totalIncome, totalExpenses } = useTransactions();
  
  const balance = totalIncome - totalExpenses;
  
  // Calculate today's expenses
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.timestamp).setHours(0, 0, 0, 0) === today)
    .reduce((sum, t) => sum + t.amount, 0);

  // Get 3 most recent transactions
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="home-dashboard animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="title" style={{ marginBottom: '0.25rem' }}>Piggy</h1>
          <p className="subtitle">Hello, what did we buy today?</p>
        </div>
        <div className="avatar">🐷</div>
      </div>

      <div className="glass-panel text-center hero-card">
        <p className="subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Current Balance</p>
        <h2 className="balance-display">${balance.toLocaleString()}</h2>
        
        <div className="flex-between stats-row">
          <div className="stat-item text-success">
            <ArrowUpRight size={16} /> ${totalIncome.toLocaleString()}
          </div>
          <div className="stat-item text-danger">
            <ArrowDownRight size={16} /> ${totalExpenses.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-panel mini-card" style={{ borderColor: 'var(--accent-glow)' }}>
          <div className="flex-between">
            <span className="subtitle">Today's Spend</span>
            <TrendingUp size={16} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>${todaysExpenses.toLocaleString()}</h3>
        </div>
        
        <div className="glass-panel mini-card">
          <div className="flex-between">
            <span className="subtitle">Monthly Budget</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coming soon</span>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>--</h3>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Recent Activity</h3>
          <span className="subtitle" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>See all</span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '2rem 1rem' }}>
            <p className="subtitle">No transactions yet. Tap the + to start!</p>
          </div>
        ) : (
          <div className="recent-list">
            {recentTransactions.map(t => (
              <div key={t.id} className="glass-panel transaction-item">
                <div className="flex-between">
                  <div>
                    <div style={{ fontWeight: '600' }}>{t.categoryId || 'Other'}</div>
                    <div className="subtitle" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                      {t.note || new Date(t.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={t.type === 'income' ? 'text-success' : 'text-primary'} style={{ fontWeight: '700' }}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .avatar {
          width: 45px;
          height: 45px;
          background: rgba(236, 72, 153, 0.2);
          border: 1px solid var(--accent-glow);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        .hero-card {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(76, 29, 149, 0.4));
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }
        .hero-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .balance-display {
          font-size: 3rem;
          font-weight: 800;
          margin: 0.5rem 0 1.5rem 0;
          text-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .stats-row {
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          padding: 0.75rem 1rem;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .mini-card {
          padding: 1rem;
          margin-bottom: 0;
        }
        .transaction-item {
          padding: 1rem;
          margin-bottom: 0.75rem;
        }
        .transaction-item:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};
