import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useUser } from '../context/UserContext'
import { getScoreColor, getScoreLabel, getGreeting, formatINR } from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import { Zap, Bot, Target } from 'lucide-react'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function SkeletonCard({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} />
}

function SubScoreCard({ label, score }) {
  const color = getScoreColor(score)
  return (
    <motion.div variants={item} className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#94A3B8] text-sm font-medium">{label}</p>
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="score-bar">
        <motion.div
          className="score-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
      <p className="text-xs text-[#94A3B8] mt-2">/ 100</p>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, hasProfile } = useUser()
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hasProfile) return
    const target = user.scores.overall
    let current = 0
    const step = target / 60
    const interval = setInterval(() => {
      current = Math.min(current + step, target)
      setAnimatedScore(Math.round(current))
      if (current >= target) clearInterval(interval)
    }, 25)
    return () => clearInterval(interval)
  }, [hasProfile, user.scores.overall])

  if (!hasProfile && !isLoading) return <EmptyState />

  const { scores, expenses, savings, income, loans, goal } = user
  const totalExpenses = Object.values(expenses || {}).reduce((a, b) => a + Number(b), 0)
    + (loans?.hasLoan ? Number(loans?.emi || 0) : 0)
  const surplus = income - totalExpenses
  const emfMonths = savings / (totalExpenses || 1)
  const savingsRateVal = income > 0 ? (income - totalExpenses) / income : 0

  const insights = []
  if (scores.emergencyFund < 40)
    insights.push({ border: '#EF4444', bg: 'rgba(239,68,68,0.05)', text: '🔴 Emergency fund critically low — you have less than 2 months of expenses saved.' })
  if (savingsRateVal < 0.15)
    insights.push({ border: '#F59E0B', bg: 'rgba(245,158,11,0.05)', text: '🟡 Savings rate below recommended — aim for at least 20% of income.' })
  if (scores.debtHealth > 70)
    insights.push({ border: '#22C55E', bg: 'rgba(34,197,94,0.05)', text: '🟢 Debt levels are healthy — you\'re managing loans well.' })
  if (insights.length === 0)
    insights.push({ border: '#22C55E', bg: 'rgba(34,197,94,0.05)', text: '🟢 Your finances look solid! Keep up the great momentum.' })

  const scoreColor = getScoreColor(animatedScore)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 md:pb-8 px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[#94A3B8] text-sm mb-1">{getGreeting()}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
          {user.name || 'Friend'} 👋
        </h1>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard className="h-56" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
          <SkeletonCard className="h-32" />
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
          {/* Health Score Card */}
          <motion.div variants={item} className="card p-8 text-center">
            <p className="text-[#94A3B8] text-sm font-medium mb-6">Overall Financial Health Score</p>
            <div className="flex flex-col items-center gap-4">
              <div style={{ width: 180, height: 180 }}>
                <CircularProgressbar
                  value={animatedScore}
                  text={`${animatedScore}`}
                  styles={buildStyles({
                    textSize: '22px',
                    textColor: '#F8FAFC',
                    pathColor: scoreColor,
                    trailColor: '#334155',
                    pathTransitionDuration: 0.5,
                  })}
                />
              </div>
              <div>
                <p className="text-lg font-bold mt-2" style={{ color: scoreColor }}>
                  {getScoreLabel(animatedScore)}
                </p>
                <p className="text-[#94A3B8] text-sm mt-1">Your overall financial health</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#334155] grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-white font-bold text-lg">{formatINR(income)}</p>
                <p className="text-[#94A3B8] text-xs">Monthly Income</p>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{formatINR(surplus)}</p>
                <p className="text-[#94A3B8] text-xs">Monthly Surplus</p>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{emfMonths.toFixed(1)}mo</p>
                <p className="text-[#94A3B8] text-xs">Emergency Fund</p>
              </div>
            </div>
          </motion.div>

          {/* Sub-score grid */}
          <div className="grid grid-cols-2 gap-4">
            <SubScoreCard label="Emergency Fund" score={scores.emergencyFund || 0} />
            <SubScoreCard label="Debt Health" score={scores.debtHealth || 0} />
            <SubScoreCard label="Savings Rate" score={scores.savingsRate || 0} />
            <SubScoreCard label="Goal Progress" score={scores.goalProgress || 0} />
          </div>

          {/* Quick Actions */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: '⚡ Simulate a Decision', to: '/simulator', color: '#F59E0B' },
              { label: '🤖 Ask FinCopilot', to: '/chat', color: '#22C55E' },
              { label: '🎯 View My Plan', to: '/profile', color: '#94A3B8' },
            ].map(({ label, to, color }) => (
              <motion.button key={to} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                onClick={() => navigate(to)}
                className="card py-5 px-4 font-semibold text-center transition-colors duration-200"
                style={{ color }}>
                {label}
              </motion.button>
            ))}
          </motion.div>

          {/* Insights */}
          <motion.div variants={item}>
            <h2 className="text-lg font-bold text-white mb-3">💡 Insights</h2>
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <motion.div key={i} variants={item}
                  className="card px-5 py-4 text-sm font-medium leading-relaxed"
                  style={{ borderLeft: `4px solid ${ins.border}`, background: ins.bg, borderRadius: '12px' }}>
                  {ins.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Goal */}
          {goal && (
            <motion.div variants={item} className="card p-5 flex items-center gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <p className="text-[#94A3B8] text-xs mb-1">Current Goal</p>
                <p className="text-white font-bold">{goal}</p>
              </div>
              <button onClick={() => navigate('/profile')}
                className="ml-auto text-[#22C55E] text-sm font-medium hover:underline">
                View Plan →
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
