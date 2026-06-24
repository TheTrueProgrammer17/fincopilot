import React, { createContext, useContext, useState } from 'react'

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
  const [user, setUser] = useState(defaultState)

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  const resetUser = () => setUser(defaultState)

  const hasProfile = user.income > 0

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser, hasProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
