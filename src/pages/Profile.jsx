import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { formatINR, getScoreColor } from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import { Edit2, TrendingUp, CheckCircle2, RefreshCw, LogOut } from 'lucide-react'

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#334155] last:border-0">
      <span className="text-[#94A3B8] text-sm">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-[#22C55E]' : 'text-white'}`}>{value}</span>
    </div>
  )
}

function RoadmapStep({ month, text, done }) {
  return (
    <motion.div variants={item} className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ background: done ? 'rgba(34,197,94,0.15)' : '#334155', color: done ? '#22C55E' : '#94A3B8', border: `1px solid ${done ? 'rgba(34,197,94,0.4)' : '#475569'}` }}>
          {done ? <CheckCircle2 size={16} color="#22C55E" /> : month.split('-')[0]}
        </div>
        <div className="flex-1 w-px mt-1 mb-1" style={{ background: done ? 'rgba(34,197,94,0.2)' : '#334155', minHeight: 24 }} />
      </div>
      <div className="pb-4">
        <p className="text-[#22C55E] text-xs font-semibold mb-0.5">Month {month}</p>
        <p className="text-[#F8FAFC] text-sm leading-relaxed">{text}</p>
      </div>
    </motion.div>
  )
}

function buildRoadmap(goal, income, expenses, loans, savings) {
  const totalExpenses = Object.values(expenses || {}).reduce((a, b) => a + Number(b), 0)
    + (loans?.hasLoan ? Number(loans?.emi || 0) : 0)
  const surplus = income - totalExpenses
  const sipAmt = Math.round(surplus * 0.3)
  const emfSave = Math.round(surplus * 0.7)

  const maps = {
    'Build Emergency Fund': [
      { month: '1–3', text: `Save ${formatINR(emfSave)}/month toward your emergency fund` },
      { month: '4', text: `Emergency fund reaches ~1 month of expenses (${formatINR(totalExpenses)})` },
      { month: '5–8', text: `Continue building — target 3 months of expenses` },
      { month: '6', text: `Begin SIP of ${formatINR(sipAmt)}/month in a liquid mutual fund` },
      { month: '12', text: `Emergency fund complete — increase investments to ${formatINR(surplus * 0.5)}/month` },
    ],
    'Start Investing': [
      { month: '1', text: `Open a demat + mutual fund account (Zerodha, Groww, etc.)` },
      { month: '2', text: `Start SIP of ${formatINR(sipAmt)}/month in ELSS + index funds` },
      { month: '3–6', text: `Build emergency fund of ${formatINR(totalExpenses * 3)} in parallel` },
      { month: '7–12', text: `Increase SIP by 10% as income grows. Review portfolio quarterly` },
    ],
    'Buy a Vehicle': [
      { month: '1–2', text: `Research vehicle options — set a budget of ${formatINR(income * 6)}` },
      { month: '3–4', text: `Save ${formatINR(emfSave)}/month for down payment (aim for 30%)` },
      { month: '5', text: `Apply for vehicle loan — compare interest rates across 3 banks` },
      { month: '6', text: `EMI should not exceed ${formatINR(income * 0.15)}/month for comfort` },
    ],
    'Education / MBA': [
      { month: '1–2', text: `Research colleges — shortlist by ROI and scholarship availability` },
      { month: '3', text: `Save ${formatINR(emfSave)}/month for application fees & prep` },
      { month: '4–8', text: `Explore education loans — interest rates of 8–12% are normal` },
      { month: '9–12', text: `Apply for loans early, check moratorium periods and tax benefits` },
    ],
    'House Down Payment': [
      { month: '1–3', text: `Save ${formatINR(emfSave)}/month dedicated to down payment fund` },
      { month: '4–6', text: `Invest savings in liquid funds for ~6% returns vs savings account` },
      { month: '7–12', text: `Improve CIBIL score by paying all EMIs on time — aim for 750+` },
      { month: '12+', text: `Target ${formatINR(surplus * 24)} as 20% down payment in 2 years` },
    ],
  }

  return maps[goal] || maps['Build Emergency Fund']
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, hasProfile, resetUser } = useUser()
  const { logout } = useAuth()

  if (!hasProfile) return <EmptyState message="Complete onboarding to see your financial profile and roadmap." />

  const { name, income, expenses, savings, loans, goal, scores } = user
  const totalExpenses = Object.values(expenses || {}).reduce((a, b) => a + Number(b), 0)
    + (loans?.hasLoan ? Number(loans?.emi || 0) : 0)
  const surplus = income - totalExpenses
  const roadmap = buildRoadmap(goal, income, expenses, loans, savings)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 md:pb-8 px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">My Profile</h1>
          <p className="text-[#94A3B8] mt-1">Your financial summary & roadmap</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/onboarding')}
            className="btn-outline flex items-center gap-2 text-sm px-3 py-2">
            <Edit2 size={15} /> <span className="hidden sm:inline">Edit</span>
          </button>
          <button onClick={resetUser}
            className="btn-outline flex items-center gap-2 text-sm px-3 py-2 border-red-500/30 text-red-400 hover:bg-red-500/10">
            <RefreshCw size={15} /> <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={logout}
            className="md:hidden btn-outline flex items-center gap-2 text-sm px-3 py-2 border-gray-500/30 text-gray-400 hover:bg-gray-500/10">
            <LogOut size={15} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
        {/* Financial Summary */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} color="#22C55E" />
            <h2 className="font-bold text-white">Financial Summary</h2>
          </div>
          <Row label="Name" value={name || '—'} />
          <Row label="Monthly Income" value={formatINR(income)} highlight />
          <Row label="Total Monthly Expenses" value={formatINR(totalExpenses)} />
          <Row label="Monthly Surplus" value={formatINR(surplus)} highlight={surplus > 0} />
          <Row label="Current Savings" value={formatINR(savings)} />
          {loans?.hasLoan && <Row label="Loan EMI" value={formatINR(loans.emi)} />}
          <Row label="Primary Goal" value={goal || '—'} highlight />
        </motion.div>

        {/* Score summary */}
        <motion.div variants={item} className="card p-6">
          <h2 className="font-bold text-white mb-5">Health Scores</h2>
          <div className="space-y-4">
            {[
              { label: 'Overall', score: scores.overall },
              { label: 'Emergency Fund', score: scores.emergencyFund },
              { label: 'Debt Health', score: scores.debtHealth },
              { label: 'Savings Rate', score: scores.savingsRate },
            ].map(({ label, score }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[#94A3B8]">{label}</span>
                  <span className="font-bold" style={{ color: getScoreColor(score) }}>{score}/100</span>
                </div>
                <div className="score-bar">
                  <motion.div
                    className="score-bar-fill"
                    style={{ background: getScoreColor(score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goal Roadmap */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🗓️</span>
            <div>
              <h2 className="font-bold text-white">Goal Roadmap</h2>
              <p className="text-[#94A3B8] text-sm">{goal}</p>
            </div>
          </div>
          <div className="pl-1">
            {roadmap.map((step, i) => (
              <RoadmapStep key={i} month={step.month} text={step.text} done={i === 0} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
