import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSACTION_STORAGE_KEY = 'piggy_transactions';

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('piggy_profiles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse profiles", e);
    }
    return [{ id: 'daily', name: 'Daily', icon: '🐷' }];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    return localStorage.getItem('piggy_active_profile') || 'daily';
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(TRANSACTION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Data Migration: Ensure all existing transactions belong to a profile
        return parsed.map(t => ({
          ...t,
          profileId: t.profileId || 'daily'
        }));
      }
    } catch (e) {
      console.error("Failed to parse transactions", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('piggy_profiles', JSON.stringify(profiles));
    localStorage.setItem('piggy_active_profile', activeProfileId);
    localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(transactions));
  }, [profiles, activeProfileId, transactions]);

  // Profile Management
  const addProfile = (name, icon) => {
    const newProfile = { id: Date.now().toString(), name, icon };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const deleteProfile = (id) => {
    if (profiles.length <= 1) return; // Prevent deleting last profile
    setProfiles(prev => prev.filter(p => p.id !== id));
    setTransactions(prev => prev.filter(t => t.profileId !== id)); // Delete associated txs
    if (activeProfileId === id) {
      setActiveProfileId(profiles.filter(p => p.id !== id)[0].id);
    }
  };

  const addTransaction = (transaction) => {
    setTransactions(prev => [
      {
        ...transaction,
        id: Date.now().toString(),
        timestamp: Date.now(),
        profileId: activeProfileId // Link to active profile
      },
      ...prev
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Derived state calculations (Filtered by active profile)
  const activeTransactions = transactions.filter(t => t.profileId === activeProfileId);

  const totalExpenses = activeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = activeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <TransactionContext.Provider value={{
      profiles,
      activeProfileId,
      setActiveProfileId,
      addProfile,
      deleteProfile,
      transactions: activeTransactions, // Expose only active txs universally
      addTransaction,
      deleteTransaction,
      totalExpenses,
      totalIncome
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
