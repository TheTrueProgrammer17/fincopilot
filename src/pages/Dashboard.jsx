import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { calculateDashboardMetrics, getLast6MonthsCashflow, formatINR } from '../utils/helpers'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Zap, Bot, Plus, AlertCircle, CheckCircle, Info } from 'lucide-react'
import 'react-circular-progressbar/dist/styles.css'

const CAT_COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#94A3B8', '#F97316', '#14B8A6']

const ttStyle = {
  contentStyle: { background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#F8FAFC' },
  labelStyle: { color: '#94A3B8' },
}

export default function Dashboard() {
  const { user, transactions } = useUser()
  const navigate = useNavigate()
  const [animatedScore, setAnimatedScore] = useState(0)

  const metrics = calculateDashboardMetrics(transactions, user)
  const cashflow = getLast6MonthsCashflow(transactions)
  const score = metrics.scores.overall
  const scoreColor = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444'
  const scoreLabel = score >= 70 ? 'Healthy' : score >= 40 ? 'Room for Improvement' : 'Needs Attention'

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current = Math.min(current + score / 60, score)
      setAnimatedScore(Math.round(current))
      if (current >= score) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [score])

  const pieData = Object.entries(metrics.categorySpend).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
  const topCats = Object.entries(metrics.categorySpend).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, value]) => ({ name, value }))
  const subScores = [
    { label: 'Savings Rate', value: metrics.scores.savings, color: '#22C55E' },
    { label: 'Debt Health', value: metrics.scores.debt, color: '#3B82F6' },
    { label: 'Emergency Fund', value: metrics.scores.emergency_fund, color: '#F59E0B' },
    { label: 'Goals', value: metrics.scores.goals, color: '#8B5CF6' },
  ]
  const insightCards = [
    metrics.scores.emergency_fund < 40
      ? { type: 'danger', icon: AlertCircle, text: `Emergency fund covers only ${metrics.emfMonths} months. You need ${formatINR(Math.max(0, Math.round((6 - metrics.emfMonths) * metrics.monthlyExpenses)))} more to reach the 6-month target.` }
      : { type: 'success', icon: CheckCircle, text: `Emergency fund is solid at ${metrics.emfMonths} months. You're protected against unexpected expenses.` },
    metrics.savingsRate < 20
      ? { type: 'warning', icon: Info, text: `Savings rate is ${metrics.savingsRate}% — below the 20% target. Save ${formatINR(Math.round(metrics.monthlyIncome * 0.2 - metrics.netSavings))} more monthly to hit the goal.` }
      : { type: 'success', icon: CheckCircle, text: `Savings rate of ${metrics.savingsRate}% is on track. You're consistently building wealth.` },
    topCats[0]
      ? { type: 'info', icon: Info, text: `Top spend: ${topCats[0].name} at ${formatINR(topCats[0].value)} this month (${metrics.monthlyExpenses > 0 ? ((topCats[0].value / metrics.monthlyExpenses) * 100).toFixed(0) : 0}% of expenses).` }
      : { type: 'info', icon: Info, text: 'Add transactions to see personalized spending insights.' },
  ]

  if (!user.income) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-[#94A3B8] mb-4">Complete your profile to see your dashboard</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary px-6 py-2">Get Started</button>
        </div>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="p-6 space-y-5 pb-24 md:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {user.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="text-[#94A3B8] text-sm mt-0.5">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} overview
            {transactions.length > 0 && <span className="ml-2 text-green-400">· {transactions.length} transactions</span>}
          </p>
        </div>
        <button onClick={() => navigate('/transactions')}
          className="hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ background: '#22C55E', color: '#fff' }}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* KPI Row — 5 cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Monthly Income', value: formatINR(metrics.monthlyIncome), up: true, sub: 'This month' },
          { label: 'Monthly Expenses', value: formatINR(metrics.monthlyExpenses), up: metrics.monthlyExpenses <= metrics.monthlyIncome * 0.7, sub: 'This month' },
          { label: 'Net Savings', value: formatINR(Math.abs(metrics.netSavings)), up: metrics.netSavings >= 0, color: metrics.netSavings >= 0 ? '#22C55E' : '#EF4444', sub: metrics.netSavings >= 0 ? 'Positive ✓' : 'Overspending ⚠' },
          { label: 'Savings Rate', value: `${metrics.savingsRate}%`, up: metrics.savingsRate >= 20, sub: 'Target: 20%' },
          { label: 'Emergency Fund', value: `${metrics.emfMonths} mo`, up: metrics.emfMonths >= 3, sub: 'Target: 6 months' },
        ].map((kpi, i) => (
          <div key={i} className="card p-4">
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color || '#F8FAFC' }}>{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {kpi.up ? <TrendingUp size={12} className="text-green-400" /> : <TrendingDown size={12} className="text-red-400" />}
              <span className="text-xs text-[#94A3B8]">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 — Health Score | Expense Donut | Cashflow */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">

        {/* Health Score — 3 cols */}
        <div className="md:col-span-3 card p-5">
          <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-4">Financial Health</p>
          <div className="flex flex-col items-center">
            <div style={{ width: 144, height: 144 }}>
              <CircularProgressbar value={animatedScore} text={`${animatedScore}`}
                styles={buildStyles({ textSize: '24px', textColor: scoreColor, pathColor: scoreColor, trailColor: '#334155', pathTransitionDuration: 0.5 })} />
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: scoreColor }}>{scoreLabel}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">/ 100 points</p>
          </div>
          <div className="mt-5 space-y-3">
            {subScores.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#94A3B8]">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#334155' }}>
                  <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Donut — 3 cols */}
        <div className="md:col-span-3 card p-5">
          <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-4">Expense Breakdown</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...ttStyle} formatter={v => formatINR(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                {pieData.map(({ name, value }, i) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                    <span className="text-xs text-[#94A3B8] truncate">{name}</span>
                    <span className="text-xs text-white ml-auto">{formatINR(value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-3xl mb-2">🥧</p>
              <p className="text-[#94A3B8] text-sm">No expense data yet</p>
              <button onClick={() => navigate('/transactions')} className="mt-3 text-green-400 text-sm hover:underline">Add transactions →</button>
            </div>
          )}
        </div>

        {/* Cashflow Area Chart — 4 cols */}
        <div className="md:col-span-4 card p-5">
          <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-4">6-Month Cash Flow</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={cashflow} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                {[['gInc', '#22C55E'], ['gExp', '#EF4444'], ['gSav', '#F59E0B']].map(([id, color]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => v === 0 ? '0' : `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...ttStyle} formatter={v => formatINR(v)} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#22C55E" strokeWidth={2} fill="url(#gInc)" dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#gExp)" dot={false} />
              <Area type="monotone" dataKey="savings" name="Savings" stroke="#F59E0B" strokeWidth={2} fill="url(#gSav)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 — Top Spending | AI Insights | Quick Actions + Goal */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">

        {/* Top Spending Horizontal Bar — 4 cols */}
        <div className="md:col-span-4 card p-5">
          <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-4">Top Spending Categories</p>
          {topCats.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={topCats} layout="vertical" margin={{ left: 0, right: 35, top: 0, bottom: 0 }}>
                <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={75} />
                <Tooltip {...ttStyle} formatter={v => formatINR(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {topCats.map((_, i) => <Cell key={i} fill={CAT_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-[#94A3B8] text-sm text-center">Add expense transactions to see breakdown</p>
            </div>
          )}
        </div>

        {/* AI Insights — 4 cols */}
        <div className="md:col-span-4 card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider">Insights</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              ✦ Gemini
            </span>
          </div>
          <div className="space-y-3">
            {insightCards.map(({ type, icon: Icon, text }, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg" style={{
                borderLeft: `2px solid ${type === 'danger' ? '#EF4444' : type === 'warning' ? '#F59E0B' : type === 'success' ? '#22C55E' : '#3B82F6'}`,
                background: type === 'danger' ? 'rgba(239,68,68,0.05)' : type === 'warning' ? 'rgba(245,158,11,0.05)' : type === 'success' ? 'rgba(34,197,94,0.05)' : 'rgba(59,130,246,0.05)'
              }}>
                <Icon size={15} className="flex-shrink-0 mt-0.5"
                  style={{ color: type === 'danger' ? '#EF4444' : type === 'warning' ? '#F59E0B' : type === 'success' ? '#22C55E' : '#3B82F6' }} />
                <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Goal — 2 cols */}
        <div className="md:col-span-2 space-y-3">
          <div className="card p-4">
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { icon: Zap, label: 'Simulate Decision', path: '/simulator', color: '#F59E0B' },
                { icon: Bot, label: 'Ask Copilot', path: '/chat', color: '#3B82F6' },
                { icon: Plus, label: 'Add Transaction', path: '/transactions', color: '#22C55E' },
              ].map(({ icon: Icon, label, path, color }) => (
                <button key={path} onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                  style={{ background: '#0F172A' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0F172A'}>
                  <Icon size={15} style={{ color }} />
                  <span className="text-sm text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-2">Current Goal</p>
            <p className="text-white font-medium text-sm mb-2">{user.goal || 'No goal set'}</p>
            <div className="h-1.5 rounded-full" style={{ background: '#334155' }}>
              <div className="h-full rounded-full" style={{ width: `${metrics.scores.goals}%`, background: '#22C55E' }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-[#94A3B8]">{metrics.scores.goals}%</span>
              <button onClick={() => navigate('/profile')} className="text-xs text-green-400 hover:underline">View Plan →</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
