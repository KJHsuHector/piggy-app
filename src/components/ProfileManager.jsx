import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { UserCircle, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const ProfileManager = () => {
  const { profiles, activeProfileId, setActiveProfileId, addProfile, deleteProfile } = useTransactions();
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newProfileName.trim() === '') return;
    
    // Default to a folder icon, or a Piggy icon.
    addProfile(newProfileName.trim(), '📁');
    setNewProfileName('');
    setIsAdding(false);
  };

  return (
    <div className="profile-manager animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 className="title" style={{ marginBottom: '0.25rem' }}>Ledgers</h2>
        <p className="subtitle" style={{ marginBottom: '1.25rem' }}>Separate your tracking</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', paddingBottom: '1rem' }}>
        {profiles.map(profile => {
          const isActive = profile.id === activeProfileId;
          return (
            <div 
              key={profile.id} 
              className={`glass-panel flex-between ${isActive ? 'active-profile-card' : ''}`}
              style={{ cursor: 'pointer', borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-color)', marginBottom: '1rem' }}
              onClick={() => setActiveProfileId(profile.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="flex-center" style={{ width: '45px', height: '45px', borderRadius: '50%', background: isActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.05)', fontSize: '1.5rem' }}>
                  {profile.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: isActive ? '700' : '500', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {profile.name}
                  </h3>
                  {isActive && <span className="subtitle" style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>Active Ledger</span>}
                </div>
              </div>
              
              <div className="flex-center" style={{ gap: '0.75rem' }}>
                {isActive && <CheckCircle2 size={24} color="var(--accent-primary)" />}
                {!isActive && profiles.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete ledger "${profile.name}" and all its transactions? This cannot be undone.`)) {
                        deleteProfile(profile.id);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem' }}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isAdding ? (
          <form className="glass-panel" onSubmit={handleAddSubmit} style={{ borderStyle: 'dashed' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Create New Ledger</h3>
            <div className="flex-between" style={{ gap: '0.75rem' }}>
              <input 
                autoFocus
                type="text" 
                className="glass-input" 
                style={{ flex: 1, marginBottom: 0 }}
                placeholder="e.g. Renovation, Trip to Japan..." 
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!newProfileName.trim()}>
                Save
              </button>
              <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsAdding(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button 
            className="glass-panel flex-center" 
            style={{ width: '100%', borderStyle: 'dashed', color: 'var(--text-secondary)', gap: '0.5rem', cursor: 'pointer' }}
            onClick={() => setIsAdding(true)}
          >
            <Plus size={20} />
            <span>Add New Ledger</span>
          </button>
        )}
      </div>

      <style>{`
        .active-profile-card {
          box-shadow: 0 4px 20px var(--accent-glow);
          transform: translateY(-2px);
          transition: all 0.2s;
        }
      `}</style>
    </div>
  );
};
