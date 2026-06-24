/**
 * Returns score color based on value (0-100)
 */
export function getScoreColor(score) {
  if (score <= 40) return '#EF4444'
  if (score <= 70) return '#F59E0B'
  return '#22C55E'
}

/**
 * Returns score label based on value
 */
export function getScoreLabel(score) {
  if (score <= 40) return 'Needs Immediate Attention'
  if (score <= 70) return 'Room for Improvement'
  return 'Healthy'
}

/**
 * Returns greeting based on current hour
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/**
 * Formats number as Indian Rupee string
 */
export function formatINR(amount) {
  if (!amount) return '₹0'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

/**
 * Calculates all scores from user financial data
 */
export function calculateScores({ income, expenses, savings, loans }) {
  const { rent = 0, food = 0, transport = 0, entertainment = 0, other = 0 } = expenses || {}
  const { hasLoan = false, emi = 0 } = loans || {}

  const totalExpenses = rent + food + transport + entertainment + other + (hasLoan ? emi : 0)
  const savingsRate = income > 0 ? (income - totalExpenses) / income : 0
  const debtRatio = hasLoan ? emi / income : 0
  const emfMonths = savings / (totalExpenses || 1)

  const savingsScore = Math.min(100, Math.max(0, savingsRate * 500))
  const debtScore = Math.max(0, 100 - debtRatio * 200)
  const emfScore = Math.min(100, (emfMonths / 6) * 100)
  const goalScore = 10

  const overall = Math.round(savingsScore * 0.30 + debtScore * 0.30 + emfScore * 0.25 + goalScore * 0.15)

  return {
    overall,
    emergencyFund: Math.round(emfScore),
    debtHealth: Math.round(debtScore),
    savingsRate: Math.round(savingsScore),
    goalProgress: goalScore,
    // raw values for simulator
    _totalExpenses: totalExpenses,
    _savingsRate: savingsRate,
    _emfMonths: emfMonths,
    _debtRatio: debtRatio,
  }
}

/**
 * Builds a backend-compatible profile object from UserContext user state
 */
export const buildProfile = (user) => ({
  name: user.name || 'User',
  income: Number(user.income) || 0,
  rent: Number(user.expenses?.rent) || 0,
  food: Number(user.expenses?.food) || 0,
  transport: Number(user.expenses?.transport) || 0,
  entertainment: Number(user.expenses?.entertainment) || 0,
  other: Number(user.expenses?.other) || 0,
  savings: Number(user.savings) || 0,
  has_loan: user.loans?.hasLoan || false,
  loan_amount: Number(user.loans?.amount) || 0,
  emi: Number(user.loans?.emi) || 0,
  goal: user.goal || 'Build Emergency Fund'
})

/**
 * Filters transactions to a specific year+month
 */
export const getMonthlyTransactions = (transactions, year, month) =>
  transactions.filter(t => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() === month
  })

/**
 * Calculates full dashboard metrics from transactions + onboarding baseline
 */
export const calculateDashboardMetrics = (transactions, user) => {
  const now = new Date()
  const monthly = getMonthlyTransactions(transactions, now.getFullYear(), now.getMonth())

  const monthlyIncome = monthly.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || Number(user.income) || 0
  const monthlyExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const netSavings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0

  const categorySpend = {}
  monthly.filter(t => t.type === 'expense').forEach(t => {
    categorySpend[t.category] = (categorySpend[t.category] || 0) + Number(t.amount)
  })

  const totalSavings = (Number(user.savings) || 0) + netSavings
  const emfMonths = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0
  const debtRatio = user.loans?.hasLoan ? ((Number(user.loans.emi) / monthlyIncome) * 100) : 0

  const savingsScore = Math.min(100, savingsRate * 5)
  const debtScore = Math.max(0, 100 - debtRatio * 2)
  const emfScore = Math.min(100, (emfMonths / 6) * 100)
  const overall = Math.round(savingsScore * 0.30 + debtScore * 0.30 + emfScore * 0.25 + 10 * 0.15)

  return {
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    savingsRate: Math.round(savingsRate * 10) / 10,
    categorySpend,
    emfMonths: Math.round(emfMonths * 10) / 10,
    totalSavings: Math.round(totalSavings),
    scores: {
      overall,
      savings: Math.round(savingsScore),
      debt: Math.round(debtScore),
      emergency_fund: Math.round(emfScore),
      goals: 10
    }
  }
}

/**
 * Returns income/expense/savings data for the last 6 months (for line chart)
 */
export const getLast6MonthsCashflow = (transactions) => {
  const result = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthly = getMonthlyTransactions(transactions, d.getFullYear(), d.getMonth())
    const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    result.push({
      month: d.toLocaleString('default', { month: 'short' }),
      income,
      expenses,
      savings: income - expenses
    })
  }
  return result
}

