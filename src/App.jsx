import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { AddTransaction } from './components/AddTransaction';
import { HistoryList } from './components/HistoryList';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ProfileManager } from './components/ProfileManager';
import { PiggyBank, Plus } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setCurrentTab('add');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeDashboard />;
      case 'add':
        return (
          <AddTransaction 
            initialTransaction={editingTransaction}
            onSave={() => {
              setEditingTransaction(null);
              setCurrentTab('home');
            }} 
          />
        );
      case 'history':
        return <HistoryList onEdit={handleEdit} />;
      case 'stats':
        return <AnalysisDashboard />;
      case 'profile':
        return <ProfileManager />;
      default:
        return null;
    }
  };

  return (
    <div className="app-wrapper">
      <main className="main-content">
        {renderContent()}
      </main>
      
      {/* Floating Piggy Action Button */}
      {currentTab !== 'add' && (
        <button 
          className="piggy-fab"
          onClick={() => {
            setEditingTransaction(null); // Ensure we start fresh
            setCurrentTab('add')
          }}
          aria-label="Add Transaction"
        >
          <div className="piggy-icon">
            <span style={{ fontSize: '32px', lineHeight: 1 }}>🐷</span>
            <div className="fab-plus-badge">
              <Plus size={16} strokeWidth={3} />
            </div>
          </div>
        </button>
      )}

      {currentTab !== 'add' && (
        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}
    </div>
  );
}

export default App;
