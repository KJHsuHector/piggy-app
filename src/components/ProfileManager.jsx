import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Plus, Trash2, CheckCircle2, Cloud, CloudOff, LogIn, LogOut, Loader2 } from 'lucide-react';

export const ProfileManager = () => {
  const { 
    profiles, activeProfile, activeProfileId, setActiveProfileId, 
    addProfile, deleteProfile, addCategory, deleteCategory,
    user, isSyncing, loginWithGoogle, logout
  } = useTransactions();
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('🍔');
  const [catType, setCatType] = useState('expense');
  const [catColor, setCatColor] = useState('#ec4899');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newProfileName.trim() === '') return;
    
    // Default to a folder icon, or a Piggy icon.
    addProfile(newProfileName.trim(), '📁');
    setNewProfileName('');
    setIsAddingProfile(false);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!catName.trim() || !catEmoji.trim()) return;

    addCategory(activeProfileId, {
      label: catName.trim(),
      icon: catEmoji.trim(),
      color: catColor,
      type: catType
    });
    setCatName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="profile-manager animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 className="title" style={{ marginBottom: '0.25rem' }}>Account & Ledgers</h2>
        <p className="subtitle" style={{ marginBottom: '1.25rem' }}>Manage sync and tracking</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', paddingBottom: '1rem' }}>
        {/* Cloud Sync Section */}
        <div className="glass-panel" style={{ marginBottom: '1.5rem', border: user ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSyncing ? <Loader2 size={24} className="spin text-primary" /> : (user ? <Cloud size={24} color="var(--accent-primary)" /> : <CloudOff size={24} color="var(--text-secondary)" />)}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: user ? 'var(--accent-primary)' : 'var(--text-primary)' }}>Cloud Sync</h3>
            </div>
            {user ? (
              <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }} onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.25rem' }} onClick={loginWithGoogle}>
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
          {user ? (
             <p className="subtitle" style={{ fontSize: '0.85rem' }}>Logged in as <strong style={{color: 'var(--text-primary)'}}>{user.displayName || user.email}</strong>. Data is safely backed up.</p>
          ) : (
             <p className="subtitle" style={{ fontSize: '0.85rem' }}>Sign in with Google to automatically back up your ledgers to the cloud.</p>
          )}
        </div>

        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Your Ledgers</h3>
        
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

        {isAddingProfile ? (
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
              <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsAddingProfile(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button 
            className="glass-panel flex-center" 
            style={{ width: '100%', borderStyle: 'dashed', color: 'var(--text-secondary)', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}
            onClick={() => setIsAddingProfile(true)}
          >
            <Plus size={20} />
            <span>Add New Ledger</span>
          </button>
        )}

        {/* Categories Section for Active Profile */}
        <div style={{ marginTop: '1rem' }}>
          <h2 className="title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Categories</h2>
          <p className="subtitle" style={{ marginBottom: '1rem' }}>Manage tags for {activeProfile.name}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {activeProfile.categories.map(cat => (
              <div key={cat.id} className="glass-panel" style={{ padding: '0.5rem 0.75rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', border: `1px solid ${cat.color}40` }}>
                <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                <span style={{ fontSize: '0.85rem' }}>{cat.label}</span>
                {activeProfile.categories.length > 1 && (
                  <button onClick={() => deleteCategory(activeProfileId, cat.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAddingCategory ? (
            <form className="glass-panel" onSubmit={handleAddCategory} style={{ borderStyle: 'dashed', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <select className="glass-input" value={catType} onChange={e => setCatType(e.target.value)} style={{ padding: '0.75rem' }}>
                <option value="expense">Expense Category</option>
                <option value="income">Income Category</option>
              </select>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Emoji 🍔" 
                  value={catEmoji}
                  onChange={e => setCatEmoji(e.target.value)}
                  style={{ width: '70px', textAlign: 'center' }}
                  maxLength={2}
                />
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ flex: 1 }}
                  placeholder="Name (e.g. Snacks)" 
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                />
                <input 
                  type="color" 
                  value={catColor}
                  onChange={e => setCatColor(e.target.value)}
                  style={{ width: '45px', height: '45px', borderRadius: '8px', border: 'none', background: 'none' }}
                />
              </div>
              <div className="flex-between">
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsAddingCategory(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!catName || !catEmoji}>Add Category</button>
              </div>
            </form>
          ) : (
             <button 
              className="glass-panel flex-center" 
              style={{ width: '100%', borderStyle: 'dashed', color: 'var(--text-secondary)', gap: '0.5rem', cursor: 'pointer' }}
              onClick={() => setIsAddingCategory(true)}
            >
              <Plus size={20} />
              <span>Add Custom Category</span>
            </button>
          )}
        </div>
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
