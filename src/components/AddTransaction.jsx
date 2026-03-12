import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { X } from 'lucide-react';

export const AddTransaction = ({ onSave, initialTransaction = null }) => {
  const { addTransaction, editTransaction, activeProfile } = useTransactions();
  const [amount, setAmount] = useState(initialTransaction ? initialTransaction.amount.toString() : '0');
  const [type, setType] = useState(initialTransaction ? initialTransaction.type : 'expense'); 
  
  // Find full category object if editing
  const initialCategory = initialTransaction 
    ? activeProfile?.categories?.find(c => c.id === initialTransaction.categoryId) 
    : null;
    
  const [category, setCategory] = useState(initialCategory);
  const [note, setNote] = useState(initialTransaction?.note || '');

  const handleNumClick = (num) => {
    if (amount === '0') {
      setAmount(num);
    } else if (amount.length < 9) {
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleSubmit = () => {
    if (amount === '0' || !category) return;

    const transactionData = {
      amount: Number(amount),
      type,
      categoryId: category.id,
      note
    };

    if (initialTransaction) {
      editTransaction(initialTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    // Reset and go back
    setAmount('0');
    setCategory(null);
    setNote('');
    onSave();
  };

  const currentCategories = activeProfile?.categories || [];
  const filteredCategories = currentCategories.filter(c => 
    type === 'expense' ? c.type !== 'income' : c.type === 'income'
  );

  return (
    <div className="add-transaction-screen animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="header glass-panel" style={{ borderRadius: '0 0 20px 20px', margin: '-1.25rem -1.25rem 1rem -1.25rem', padding: '1.25rem', flexShrink: 0, position: 'relative' }}>
        <button 
          onClick={onSave} // Reuse onSave to just close the tab and return home
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        <div className="flex-center" style={{ gap: '1rem', marginBottom: '1.25rem', marginTop: '1rem' }}>
          <button 
            className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button 
            className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>

        <div className="amount-display">
          <span className="currency">$</span>
          <span className="value">{Number(amount).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className="section-title" style={{ flexShrink: 0 }}>Select Category</div>
        <div className="category-grid" style={{ flexShrink: 0 }}>
        {filteredCategories.map(cat => {
          const isSelected = category?.id === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-item ${isSelected ? 'selected' : ''}`}
              onClick={() => setCategory(cat)}
              style={{ '--cat-color': cat.color }}
            >
              <div className="cat-icon flex-center" style={{ background: isSelected ? cat.color : `${cat.color}20`, color: isSelected ? 'white' : cat.color, fontSize: '1.5rem' }}>
                {cat.icon}
              </div>
              <span className="cat-label">{cat.label}</span>
            </button>
          );
        })}
        </div>

        <textarea 
          className="glass-input full-width" 
          placeholder="Add memo/note (optional)..." 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ 
            marginTop: 'auto', 
            marginBottom: '0.5rem', 
            flexShrink: 0, 
            minHeight: '80px', 
            resize: 'none',
            fontSize: '1rem',
            padding: '0.75rem'
          }}
        />

        <div className="numpad" style={{ flexShrink: 0 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} className="num-btn" onClick={() => handleNumClick(num.toString())}>
              {num}
            </button>
          ))}
          <button className="num-btn" onClick={() => setAmount('0')}>C</button>
          <button className="num-btn" onClick={() => handleNumClick('0')}>0</button>
          <button className="num-btn" onClick={handleBackspace}>⌫</button>
        </div>

        <button 
          className="btn btn-primary full-width" 
          style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '1.1rem', flexShrink: 0 }}
          disabled={amount === '0' || !category}
          onClick={handleSubmit}
        >
          {initialTransaction ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>

      <style>{`
        .type-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: rgba(15, 23, 42, 0.5);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .active-expense {
          background: var(--danger);
          color: white;
          border-color: var(--danger);
        }
        .active-income {
          background: var(--success);
          color: white;
          border-color: var(--success);
        }
        .amount-display {
          text-align: right;
          font-size: 3rem;
          font-weight: 700;
          color: var(--text-primary);
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .amount-display .currency {
          font-size: 1.5rem;
          margin-right: 0.5rem;
          color: var(--text-secondary);
        }
        .section-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        .category-item {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .cat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .cat-label {
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 500;
          text-align: center;
        }
        .category-item.selected .cat-label {
          color: var(--text-primary);
          font-weight: 700;
        }
        .numpad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.35rem;
          margin-top: 0.25rem;
        }
        .num-btn {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.75rem;
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
        }
        .num-btn:active {
          background: rgba(255, 255, 255, 0.1);
        }
        .full-width {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
