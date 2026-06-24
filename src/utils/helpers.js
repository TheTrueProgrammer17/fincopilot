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
