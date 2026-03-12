import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc } from '../services/firebase';

const TRANSACTION_STORAGE_KEY = 'piggy_transactions';

export const DEFAULT_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍽️', color: '#f59e0b', type: 'expense' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: 'bills', label: 'Bills', icon: '📱', color: '#06b6d4', type: 'expense' },
  { id: 'salary', label: 'Salary', icon: '💼', color: '#10b981', type: 'income' },
  { id: 'other_in', label: 'Other Income', icon: '💵', color: '#10b981', type: 'income' },
  { id: 'other_out', label: 'Other Exp.', icon: '🏷️', color: '#64748b', type: 'expense' }
];

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('piggy_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Ensure existing profiles have categories
        return parsed.map(p => ({
          ...p,
          categories: p.categories || DEFAULT_CATEGORIES
        }));
      }
    } catch (e) {
      console.error("Failed to parse profiles", e);
    }
    return [{ id: 'daily', name: 'Daily', icon: '🐷', categories: DEFAULT_CATEGORIES }];
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

  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true); // default true until auth checks
  const isInitialLocalLoad = useRef(true);

  // 1. Auth Listener & Initial Cloud Pull
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsSyncing(true);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profiles?.length > 0) setProfiles(data.profiles);
            if (data.transactions) setTransactions(data.transactions);
            if (data.activeProfileId) setActiveProfileId(data.activeProfileId);
          }
        } catch (error) {
          console.error("Cloud load error", error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Persistence (Local + Cloud)
  useEffect(() => {
    if (isInitialLocalLoad.current) {
      isInitialLocalLoad.current = false;
      return;
    }

    // Always save locally
    localStorage.setItem('piggy_profiles', JSON.stringify(profiles));
    localStorage.setItem('piggy_active_profile', activeProfileId);
    localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(transactions));

    // Save to Cloud if logged in and not currently pulling from it
    if (user && !isSyncing) {
      const docRef = doc(db, 'users', user.uid);
      setDoc(docRef, {
        profiles,
        transactions,
        activeProfileId,
        lastUpdated: Date.now()
      }, { merge: true }).catch(err => console.error("Cloud sync error", err));
    }
  }, [profiles, activeProfileId, transactions, user, isSyncing]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert('Login failed');
    }
  };

  const logout = async () => {
    try {
      if (window.confirm("Logging out will stop cloud sync. Your data remains locally. Continue?")) {
        await signOut(auth);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Profile Management
  const addProfile = (name, icon) => {
    const newProfile = { id: Date.now().toString(), name, icon, categories: DEFAULT_CATEGORIES };
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

  // Category Management
  const addCategory = (profileId, category) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return { ...p, categories: [...p.categories, newCategory] };
      }
      return p;
    }));
  };

  const deleteCategory = (profileId, categoryId) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        return { ...p, categories: p.categories.filter(c => c.id !== categoryId) };
      }
      return p;
    }));
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

  const editTransaction = (id, updatedFields) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, ...updatedFields };
      }
      return t;
    }));
  };

  // Derived state calculations (Filtered by active profile)
  const activeTransactions = transactions.filter(t => t.profileId === activeProfileId);

  const totalExpenses = activeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = activeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  return (
    <TransactionContext.Provider value={{
      user,
      isSyncing,
      loginWithGoogle,
      logout,
      profiles,
      activeProfile,
      activeProfileId,
      setActiveProfileId,
      addProfile,
      deleteProfile,
      addCategory,
      deleteCategory,
      transactions: activeTransactions, // Expose only active txs universally
      addTransaction,
      deleteTransaction,
      editTransaction,
      totalExpenses,
      totalIncome
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
