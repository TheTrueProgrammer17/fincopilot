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

const CAT_COLORS = ['#2D6A2D', '#D4A843', '#C0392B', '#F39C12', '#D4728A', '#8B6914', '#4A3728', '#C0392B', '#2D6A2D']

const ttStyle = {
  contentStyle: { background: '#F0E8D8', border: '2.5px solid #2C1810', borderRadius: 0, fontFamily: 'Space Grotesk', fontSize: '12px', color: '#1A0A00' },
  labelStyle: { color: '#4A3728', fontWeight: 700 },
}

export default function Dashboard() {
  const { user, transactions } = useUser()
  const navigate = useNavigate()
  const [animatedScore, setAnimatedScore] = useState(0)

  const metrics = calculateDashboardMetrics(transactions, user)
  const cashflow = getLast6MonthsCashflow(transactions)
  const score = metrics.scores.overall
  const scoreColor = score >= 70 ? '#2D6A2D' : score >= 40 ? '#D4A843' : '#C0392B'
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
    { label: 'Savings Rate', value: metrics.scores.savings, color: '#2D6A2D' },
    { label: 'Debt Health', value: metrics.scores.debt, color: '#F39C12' },
    { label: 'Emergency Fund', value: metrics.scores.emergency_fund, color: '#D4A843' },
    { label: 'Goals', value: metrics.scores.goals, color: '#D4728A' },
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
        <div className="retro-card text-center" style={{ padding: '48px', maxWidth: '400px' }}>
          <div className="retro-titlebar">
            <span>📊 Setup Required</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '32px', background: '#F0E8D8' }}>
            <p className="text-4xl mb-4">📊</p>
            <p style={{ color: '#4A3728', marginBottom: '16px', fontWeight: 600 }}>Complete your profile to see your dashboard</p>
            <button onClick={() => navigate('/onboarding')} className="retro-btn retro-btn-green w-full">Get Started</button>
          </div>
        </div>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const kpiTitlebars = [
    'retro-titlebar-green',
    'retro-titlebar-red',
    'retro-titlebar',
    'retro-titlebar-blue',
    'retro-titlebar',
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="p-6 space-y-5 pb-24 md:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '24px', color: '#1A0A00' }}>
            {greeting}, {user.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: '#4A3728', fontSize: '13px', marginTop: '2px' }}>
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} overview
            {transactions.length > 0 && <span style={{ marginLeft: '8px', color: '#2D6A2D', fontWeight: 700 }}>· {transactions.length} transactions</span>}
          </p>
        </div>
        <button onClick={() => navigate('/transactions')}
          className="hidden md:flex retro-btn retro-btn-green items-center gap-2">
          <Plus size={14} /> Add Transaction
        </button>
      </div>

      {/* KPI Row — 5 cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Monthly Income', value: formatINR(metrics.monthlyIncome), up: true, sub: 'This month' },
          { label: 'Monthly Expenses', value: formatINR(metrics.monthlyExpenses), up: metrics.monthlyExpenses <= metrics.monthlyIncome * 0.7, sub: 'This month' },
          { label: 'Net Savings', value: formatINR(Math.abs(metrics.netSavings)), up: metrics.netSavings >= 0, color: metrics.netSavings >= 0 ? '#2D6A2D' : '#C0392B', sub: metrics.netSavings >= 0 ? 'Positive ✓' : 'Overspending ⚠' },
          { label: 'Savings Rate', value: `${metrics.savingsRate}%`, up: metrics.savingsRate >= 20, sub: 'Target: 20%' },
          { label: 'Emergency Fund', value: `${metrics.emfMonths} mo`, up: metrics.emfMonths >= 3, sub: 'Target: 6 months' },
        ].map((kpi, i) => (
          <div key={i} className="retro-card">
            <div className={`retro-titlebar ${kpiTitlebars[i]}`}>
              <span>{kpi.label}</span>
              <span className="retro-controls" />
            </div>
            <div style={{ padding: '12px', background: '#F0E8D8' }}>
              <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: kpi.color || '#1A0A00' }}>{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.up ? <TrendingUp size={12} style={{ color: '#2D6A2D' }} /> : <TrendingDown size={12} style={{ color: '#C0392B' }} />}
                <span style={{ fontSize: '11px', color: '#4A3728' }}>{kpi.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 — Health Score | Expense Donut | Cashflow */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">

        {/* Health Score — 3 cols */}
        <div className="md:col-span-3 retro-card">
          <div className="retro-titlebar">
            <span>📊 Financial Health</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
            <div className="flex flex-col items-center">
              <div style={{ width: 144, height: 144 }}>
                <CircularProgressbar value={animatedScore} text={`${animatedScore}`}
                  styles={buildStyles({
                    textSize: '24px',
                    textColor: '#1A0A00',
                    pathColor: scoreColor,
                    trailColor: '#F5F5F0',
                    pathTransitionDuration: 0.5,
                  })} />
              </div>
              <p className="mt-3 text-sm font-bold uppercase tracking-wider" style={{ color: scoreColor }}>{scoreLabel}</p>
              <p style={{ fontSize: '11px', color: '#4A3728', marginTop: '2px' }}>/ 100 points</p>
            </div>
            <div className="mt-4 space-y-3">
              {subScores.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#4A3728', fontWeight: 600 }}>{label}</span>
                    <span style={{ color: '#1A0A00', fontWeight: 700 }}>{value}</span>
                  </div>
                  <div className="retro-progress-track">
                    <div className="retro-progress-fill" style={{ width: `${value}%`, background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 8px, ${color}CC 8px, ${color}CC 10px)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Donut — 3 cols */}
        <div className="md:col-span-3 retro-card">
          <div className="retro-titlebar-red retro-titlebar">
            <span>🥧 Expense Breakdown</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
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
                      <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length], border: '1px solid #2C1810' }} />
                      <span style={{ fontSize: '11px', color: '#4A3728' }} className="truncate">{name}</span>
                      <span style={{ fontSize: '11px', color: '#1A0A00', fontWeight: 700, marginLeft: 'auto' }}>{formatINR(value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-3xl mb-2">🥧</p>
                <p style={{ color: '#4A3728', fontSize: '13px' }}>No expense data yet</p>
                <button onClick={() => navigate('/transactions')} className="mt-3 retro-btn" style={{ fontSize: '11px', padding: '4px 12px' }}>Add transactions →</button>
              </div>
            )}
          </div>
        </div>

        {/* Cashflow Area Chart — 4 cols */}
        <div className="md:col-span-4 retro-card">
          <div className="retro-titlebar-blue retro-titlebar">
            <span>📈 6-Month Cash Flow</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={cashflow} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  {[['gInc', '#2D6A2D'], ['gExp', '#C0392B'], ['gSav', '#D4A843']].map(([id, color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#8B6914" vertical={false} />
                <XAxis dataKey="month" stroke="#4A3728" tick={{ fontSize: 11, fontFamily: 'Space Grotesk', fontWeight: 600 }} tickLine={false} />
                <YAxis stroke="#4A3728" tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} tickLine={false} axisLine={false}
                  tickFormatter={v => v === 0 ? '0' : `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...ttStyle} formatter={v => formatINR(v)} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#2D6A2D" strokeWidth={2.5} fill="url(#gInc)" dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#C0392B" strokeWidth={2.5} fill="url(#gExp)" dot={false} />
                <Area type="monotone" dataKey="savings" name="Savings" stroke="#D4A843" strokeWidth={2.5} fill="url(#gSav)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 — Top Spending | AI Insights | Quick Actions + Goal */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">

        {/* Top Spending Horizontal Bar — 4 cols */}
        <div className="md:col-span-4 retro-card">
          <div className="retro-titlebar">
            <span>💸 Top Spending Categories</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
            {topCats.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={topCats} layout="vertical" margin={{ left: 0, right: 35, top: 0, bottom: 0 }}>
                  <XAxis type="number" stroke="#4A3728" tick={{ fontSize: 11, fontFamily: 'Space Grotesk' }} tickLine={false} axisLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="#4A3728" tick={{ fontSize: 12, fontFamily: 'Space Grotesk', fontWeight: 600 }} tickLine={false} axisLine={false} width={75} />
                  <Tooltip {...ttStyle} formatter={v => formatINR(v)} />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]} maxBarSize={18}>
                    {topCats.map((_, i) => <Cell key={i} fill={CAT_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p style={{ color: '#4A3728', fontSize: '13px', textAlign: 'center' }}>Add expense transactions to see breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights — 4 cols */}
        <div className="md:col-span-4 retro-card">
          <div className="retro-titlebar-green retro-titlebar">
            <span>✦ AI Insights</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
            <div className="space-y-3">
              {insightCards.map(({ type, icon: Icon, text }, i) => (
                <div key={i} className="flex gap-3 p-3" style={{
                  background: type === 'danger' ? '#F8D7D0' : type === 'warning' ? '#FDF3D0' : type === 'success' ? '#D4EDD4' : '#FDEBD0',
                  border: `2px solid ${type === 'danger' ? '#C0392B' : type === 'warning' ? '#D4A843' : type === 'success' ? '#2D6A2D' : '#F39C12'}`,
                  boxShadow: `2px 2px 0px ${type === 'danger' ? '#C0392B' : type === 'warning' ? '#D4A843' : type === 'success' ? '#2D6A2D' : '#F39C12'}`,
                }}>
                  <Icon size={15} className="flex-shrink-0 mt-0.5"
                    style={{ color: type === 'danger' ? '#C0392B' : type === 'warning' ? '#8B6914' : type === 'success' ? '#2D6A2D' : '#F39C12' }} />
                  <p style={{ fontSize: '12px', color: '#1A0A00', lineHeight: 1.5, fontWeight: 500 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions + Goal — 2 cols */}
        <div className="md:col-span-2 space-y-3">
          <div className="retro-card">
            <div className="retro-titlebar">
              <span>⚡ Quick Actions</span>
              <span className="retro-controls" />
            </div>
            <div style={{ padding: '12px', background: '#F0E8D8' }}>
              <div className="space-y-2">
                {[
                  { icon: Zap, label: 'Simulate Decision', path: '/simulator', color: '#D4A843', cls: '' },
                  { icon: Bot, label: 'Ask Copilot', path: '/chat', color: '#F39C12', cls: 'retro-btn-blue' },
                  { icon: Plus, label: 'Add Transaction', path: '/transactions', color: '#2D6A2D', cls: 'retro-btn-green' },
                ].map(({ icon: Icon, label, path, cls }) => (
                  <button key={path} onClick={() => navigate(path)}
                    className={`retro-btn ${cls} w-full text-left`}
                    style={{ fontSize: '11px', padding: '6px 10px', justifyContent: 'flex-start' }}>
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="retro-card">
            <div className="retro-titlebar-blue retro-titlebar">
              <span>🎯 Current Goal</span>
              <span className="retro-controls" />
            </div>
            <div style={{ padding: '12px', background: '#F0E8D8' }}>
              <p style={{ color: '#1A0A00', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>{user.goal || 'No goal set'}</p>
              <div className="retro-progress-track">
                <div className="retro-progress-fill green" style={{ width: `${metrics.scores.goals}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span style={{ fontSize: '11px', color: '#4A3728', fontWeight: 600 }}>{metrics.scores.goals}%</span>
                <button onClick={() => navigate('/profile')} className="retro-btn" style={{ fontSize: '10px', padding: '2px 8px' }}>View Plan →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
