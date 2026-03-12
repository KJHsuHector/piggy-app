import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Trash2, Edit2 } from 'lucide-react';

export const HistoryList = ({ onEdit }) => {
  const { transactions, deleteTransaction, activeProfile } = useTransactions();

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, t) => {
    const date = new Date(t.timestamp).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(t);
    return groups;
  }, {});

  return (
    <div className="history-list animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 className="title" style={{ marginBottom: '1.25rem', flexShrink: 0 }}>Transaction History</h2>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', paddingBottom: '1rem' }}>
        {Object.keys(groupedTransactions).length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem 1rem' }}>
          <p className="subtitle">No history available yet.</p>
        </div>
      ) : (
        Object.keys(groupedTransactions).map(date => (
          <div key={date} className="date-group" style={{ marginBottom: '1.5rem' }}>
            <div className="date-header subtitle" style={{ marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              {date}
            </div>
            
            <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
              {groupedTransactions[date].map((t, index) => {
                const catMeta = activeProfile?.categories?.find(c => c.id === t.categoryId) || { label: 'Deleted Category', icon: '❓', color: '#a1a1aa' };
                return (
                  <div 
                    key={t.id} 
                    className="history-item flex-between"
                    style={{ 
                      padding: '1rem 0',
                      borderBottom: index < groupedTransactions[date].length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="flex-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${catMeta.color}20`, color: catMeta.color, fontSize: '1.2rem' }}>
                        {catMeta.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{catMeta.label}</div>
                        {t.note && (
                          <div className="subtitle" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{t.note}</div>
                        )}
                      </div>
                    </div>
                  <div className="flex-center" style={{ gap: '0.75rem' }}>
                    <div className={t.type === 'income' ? 'text-success' : 'text-primary'} style={{ fontWeight: '700', marginRight: '0.25rem' }}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </div>
                    
                    <button 
                      onClick={() => onEdit && onEdit(t)}
                      style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem', borderRadius: '50%', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex' }}
                    >
                      <Edit2 size={16} />
                    </button>

                    <button 
                      onClick={() => {
                        if(window.confirm('Delete this transaction?')) deleteTransaction(t.id);
                      }}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem', borderRadius: '50%', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};
