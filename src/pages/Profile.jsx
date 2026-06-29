import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { formatINR, getScoreColor } from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import { Edit2, TrendingUp, CheckCircle2, RefreshCw, LogOut, ArrowLeft } from 'lucide-react'

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function Row({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '2px solid #F5F5F0',
    }}>
      <span style={{ color: '#4A3728', fontSize: '13px', fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight ? '#2D6A2D' : '#1A0A00', fontSize: '14px' }}>{value}</span>
    </div>
  )
}

function RoadmapStep({ month, text, done }) {
  return (
    <motion.div variants={item} className="flex gap-4">
      <div className="flex flex-col items-center">
        <div style={{
          width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: '11px', fontWeight: 700,
          background: done ? '#D4EDD4' : '#E8DCC8',
          color: done ? '#2D6A2D' : '#4A3728',
          border: `2px solid ${done ? '#2D6A2D' : '#2C1810'}`,
          boxShadow: done ? '2px 2px 0px #2D6A2D' : '2px 2px 0px #2C1810',
        }}>
          {done ? <CheckCircle2 size={16} color="#2D6A2D" /> : month.split('-')[0]}
        </div>
        <div style={{ width: '2px', flex: 1, marginTop: '4px', marginBottom: '4px', background: done ? '#2D6A2D' : '#F5F5F0', minHeight: '20px' }} />
      </div>
      <div style={{ paddingBottom: '16px' }}>
        <p style={{ color: '#2D6A2D', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Month {month}</p>
        <p style={{ color: '#1A0A00', fontSize: '13px', lineHeight: 1.5, fontWeight: 500 }}>{text}</p>
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

// Helper to map getScoreColor output to retro colors
function retroScoreColor(score) {
  if (score >= 70) return '#2D6A2D'
  if (score >= 40) return '#D4A843'
  return '#C0392B'
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A3728' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              My Profile
            </h1>
            <p style={{ color: '#4A3728', fontSize: '13px', marginTop: '2px', fontWeight: 500 }}>Your financial summary & roadmap</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/onboarding')}
            className="retro-btn" style={{ fontSize: '11px', padding: '6px 12px' }}>
            <Edit2 size={13} /> <span className="hidden sm:inline">Edit</span>
          </button>
          <button onClick={resetUser}
            className="retro-btn retro-btn-red" style={{ fontSize: '11px', padding: '6px 12px' }}>
            <RefreshCw size={13} /> <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={logout}
            className="retro-btn md:hidden" style={{ fontSize: '11px', padding: '6px 12px' }}>
            <LogOut size={13} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
        {/* Financial Summary */}
        <motion.div variants={item} className="retro-card">
          <div className="retro-titlebar">
            <span>📈 Financial Summary</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
            <Row label="Name" value={name || '—'} />
            <Row label="Monthly Income" value={formatINR(income)} highlight />
            <Row label="Total Monthly Expenses" value={formatINR(totalExpenses)} />
            <Row label="Monthly Surplus" value={formatINR(surplus)} highlight={surplus > 0} />
            <Row label="Current Savings" value={formatINR(savings)} />
            {loans?.hasLoan && <Row label="Loan EMI" value={formatINR(loans.emi)} />}
            <Row label="Primary Goal" value={goal || '—'} highlight />
          </div>
        </motion.div>

        {/* Score summary */}
        <motion.div variants={item} className="retro-card">
          <div className="retro-titlebar-blue retro-titlebar">
            <span>🏆 Health Scores</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }} className="space-y-4">
            {[
              { label: 'Overall', score: scores.overall },
              { label: 'Emergency Fund', score: scores.emergencyFund },
              { label: 'Debt Health', score: scores.debtHealth },
              { label: 'Savings Rate', score: scores.savingsRate },
            ].map(({ label, score }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: '#4A3728', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: retroScoreColor(score) }}>{score}/100</span>
                </div>
                <div className="retro-progress-track">
                  <motion.div
                    className={`retro-progress-fill ${retroScoreColor(score) === '#2D6A2D' ? 'green' : retroScoreColor(score) === '#C0392B' ? 'red' : ''}`}
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
        <motion.div variants={item} className="retro-card">
          <div className="retro-titlebar-green retro-titlebar">
            <span>🗓️ Goal Roadmap</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
            <p style={{ color: '#4A3728', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{goal}</p>
            <div style={{ paddingLeft: '4px' }}>
              {roadmap.map((step, i) => (
                <RoadmapStep key={i} month={step.month} text={step.text} done={i === 0} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
