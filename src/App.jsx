import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { AddTransaction } from './components/AddTransaction';
import { HistoryList } from './components/HistoryList';

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
      case 'settings':
        return <div className="flex-center" style={{height: '100%'}}><h2>Settings (Coming Soon)</h2></div>;
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
