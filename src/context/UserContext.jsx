import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const UserContext = createContext(null)

const defaultState = {
  name: '',
  income: 0,
  expenses: { rent: 0, food: 0, transport: 0, entertainment: 0, other: 0 },
  savings: 0,
  loans: { hasLoan: false, amount: 0, emi: 0 },
  goal: '',
  scores: { overall: 0, emergencyFund: 0, debtHealth: 0, savingsRate: 0, goalProgress: 0 },
}

export function UserProvider({ children }) {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState(defaultState)
  const [transactions, setTransactions] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!authUser) {
      setUser(defaultState)
      setTransactions([])
      setLoadingData(false)
      return
    }

    const loadData = async () => {
      setLoadingData(true)
      
      // Load Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()
        
      if (profile) {
        setUser({
          name: profile.name || '',
          income: profile.monthly_income,
          expenses: {
            rent: profile.rent,
            food: profile.food,
            transport: profile.transport,
            entertainment: profile.entertainment,
            other: profile.other_expenses,
          },
          savings: profile.savings,
          loans: {
            hasLoan: profile.has_loan,
            amount: profile.loan_amount,
            emi: profile.emi,
          },
          goal: profile.goal,
          scores: {
            overall: profile.health_score || 0,
            emergencyFund: 0,
            debtHealth: 0,
            savingsRate: 0,
            goalProgress: 0
          }
        })
      } else {
        setUser(defaultState)
      }

      // Load Transactions
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false })
        
      if (txs && txs.length > 0) {
        setTransactions(txs)
      } else {
        // Migration logic: check if local storage has transactions
        const saved = localStorage.getItem('fincopilot_transactions')
        if (saved) {
          try {
            const localTxs = JSON.parse(saved)
            if (localTxs.length > 0) {
              const txsToInsert = localTxs.map(t => ({
                amount: t.amount,
                category: t.category,
                description: t.description || '',
                date: t.date,
                type: t.type || 'expense',
                user_id: authUser.id
              }))
              
              const { data: insertedTxs, error } = await supabase
                .from('transactions')
                .insert(txsToInsert)
                .select()
                
              if (!error && insertedTxs) {
                setTransactions(insertedTxs)
                localStorage.removeItem('fincopilot_transactions')
              }
            }
          } catch (e) {
            console.error('Failed to migrate transactions', e)
          }
        }
      }
      
      setLoadingData(false)
    }

    loadData()
  }, [authUser])

  const updateUser = async (updates) => {
    const newState = { ...user, ...updates }
    setUser(newState)
    
    if (authUser) {
      const profileData = {
        user_id: authUser.id,
        name: newState.name,
        monthly_income: newState.income,
        rent: newState.expenses.rent,
        food: newState.expenses.food,
        transport: newState.expenses.transport,
        entertainment: newState.expenses.entertainment,
        other_expenses: newState.expenses.other,
        savings: newState.savings,
        has_loan: newState.loans.hasLoan,
        loan_amount: newState.loans.amount,
        emi: newState.loans.emi,
        goal: newState.goal,
        health_score: newState.scores.overall,
      }
      
      const { data: existing } = await supabase.from('profiles').select('id').eq('user_id', authUser.id).single()
      if (existing) {
        await supabase.from('profiles').update(profileData).eq('user_id', authUser.id)
      } else {
        await supabase.from('profiles').insert([profileData])
      }
    }
  }

  const resetUser = async () => {
    setUser(defaultState)
    if (authUser) {
      await supabase.from('profiles').delete().eq('user_id', authUser.id)
      await supabase.from('transactions').delete().eq('user_id', authUser.id)
    }
  }

  const addTransaction = async (transaction) => {
    const newTx = {
      ...transaction,
      date: transaction.date || new Date().toISOString().split('T')[0],
      user_id: authUser?.id
    }
    
    // Optimistic UI update
    const tempId = crypto.randomUUID()
    setTransactions(prev => [{ ...newTx, id: tempId }, ...prev])
    
    if (authUser) {
      const { data, error } = await supabase.from('transactions').insert([newTx]).select().single()
      if (!error && data) {
        // Replace temp ID with real ID
        setTransactions(prev => prev.map(t => t.id === tempId ? data : t))
      }
    }
  }

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
    if (authUser) {
      await supabase.from('transactions').delete().eq('id', id)
    }
  }

  const editTransaction = async (id, updated) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
    if (authUser) {
      await supabase.from('transactions').update(updated).eq('id', id)
    }
  }

  const hasProfile = user.income > 0

  return (
    <UserContext.Provider value={{
      user, updateUser, resetUser, hasProfile, loadingData,
      transactions, addTransaction, deleteTransaction, editTransaction,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
