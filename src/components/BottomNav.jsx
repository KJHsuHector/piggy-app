import React from 'react';
import { Home, PlusCircle, History, PieChart } from 'lucide-react';

export const BottomNav = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'add', icon: PlusCircle, label: 'Add', isPrimary: true },
    { id: 'history', icon: History, label: 'History' },
    { id: 'stats', icon: PieChart, label: 'Stats' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        return (
          <button 
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''} ${tab.isPrimary ? 'primary-btn' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <div className="icon-wrapper">
              <Icon size={tab.isPrimary ? 32 : 24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {!tab.isPrimary && <span className="nav-label">{tab.label}</span>}
          </button>
        );
      })}
    </nav>
  );
};
