import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { AddTransaction } from './components/AddTransaction';
import { HistoryList } from './components/HistoryList';
import { AnalysisDashboard } from './components/AnalysisDashboard';

function App() {
  const [currentTab, setCurrentTab] = useState('home');

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeDashboard />;
      case 'add':
        return <AddTransaction onSave={() => setCurrentTab('home')} />;
      case 'history':
        return <HistoryList />;
      case 'stats':
        return <AnalysisDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="app-wrapper">
      <main className="main-content">
        {renderContent()}
      </main>
      
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
