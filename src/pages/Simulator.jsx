import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { getScoreColor, formatINR, buildProfile } from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import { Loader2, ChevronRight, ArrowLeft } from 'lucide-react'

const SCENARIOS = [
  { id: 'vehicle', emoji: '🚲', label: 'Buy a Vehicle', defaultName: 'New Vehicle' },
  { id: 'apartment', emoji: '🏠', label: 'Move Apartments', defaultName: 'New Apartment' },
  { id: 'laptop', emoji: '💻', label: 'Buy a Laptop / Device', defaultName: 'New Laptop' },
  { id: 'education', emoji: '🎓', label: 'Take Education Loan', defaultName: 'Education Loan' },
  { id: 'custom', emoji: '✏️', label: 'Custom Scenario', defaultName: '' },
]

function AnimatedNumber({ from, to, duration = 1500 }) {
  const [val, setVal] = useState(from)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.round(from + (to - from) * progress))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [from, to])
  return <>{val}</>
}

export default function Simulator() {
  const navigate = useNavigate()
  const { user, hasProfile } = useUser()
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', cost: '', isLoan: false, rate: '', months: '' })
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState(null)

  if (!hasProfile) return <EmptyState message="Set up your financial profile to use the simulator." />

  const { income, expenses, savings, loans, scores } = user
  const totalExpenses = Object.values(expenses || {}).reduce((a, b) => a + Number(b), 0)
    + (loans?.hasLoan ? Number(loans?.emi || 0) : 0)
  const existingEmi = loans?.hasLoan ? Number(loans?.emi || 0) : 0
  const goalScore = 10

  const handleScenarioSelect = (s) => {
    setSelected(s)
    setForm(f => ({ ...f, name: s.defaultName }))
    setResult(null)
  }

  const API_BASE = 'http://localhost:8000/api'

  const handleSimulate = async () => {
    if (!form.cost) return
    setCalculating(true)

    const totalCost = Number(form.cost)
    const loanAmount = form.isLoan ? totalCost : 0
    const interestRate = Number(form.rate) || 10
    const loanMonths = Number(form.months) || 24

    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: buildProfile(user),
          item_name: form.name || selected?.label || 'Purchase',
          total_cost: totalCost,
          is_loan: form.isLoan,
          loan_amount: loanAmount,
          interest_rate: interestRate,
          loan_months: loanMonths
        })
      })
      const data = await res.json()
      setResult({
        before: {
          overall: data.before.scores.overall,
          savingsRate: Math.round(data.before.savings_rate),
          emfMonths: String(data.before.emergency_fund_months),
        },
        after: {
          overall: data.after.scores.overall,
          savingsRate: Math.round(data.after.savings_rate),
          emfMonths: String(data.after.emergency_fund_months),
        },
        emi: data.additional_emi,
        drop: -(data.delta.overall),
        explanation: data.explanation,
      })
    } catch (e) {
      // Fallback to local calculation if backend unreachable
      const rate = interestRate
      const months = loanMonths
      const emi = loanAmount > 0
        ? (loanAmount * (rate / 1200) * Math.pow(1 + rate / 1200, months)) / (Math.pow(1 + rate / 1200, months) - 1)
        : 0
      const newTotalExpenses = totalExpenses + emi + (!form.isLoan ? totalCost / 12 : 0)
      const newSavingsRate = income > 0 ? (income - newTotalExpenses) / income : 0
      const newDebtRatio = income > 0 ? (existingEmi + emi) / income : 0
      const newEmfMonths = newTotalExpenses > 0 ? savings / newTotalExpenses : 0
      const newSavingsScore = Math.min(100, Math.max(0, newSavingsRate * 500))
      const newDebtScore = Math.max(0, 100 - newDebtRatio * 200)
      const newEmfScore = Math.min(100, (newEmfMonths / 6) * 100)
      const newOverall = Math.round(newSavingsScore * 0.30 + newDebtScore * 0.30 + newEmfScore * 0.25 + goalScore * 0.15)
      const currentSavingsRate = income > 0 ? (income - totalExpenses) / income : 0
      const currentEmf = totalExpenses > 0 ? savings / totalExpenses : 0
      setResult({
        before: { overall: scores.overall, savingsRate: Math.round(currentSavingsRate * 100), emfMonths: currentEmf.toFixed(1) },
        after: { overall: newOverall, savingsRate: Math.round(newSavingsRate * 100), emfMonths: newEmfMonths.toFixed(1) },
        emi: Math.round(emi),
        drop: scores.overall - newOverall,
        explanation: null,
      })
    }
    setCalculating(false)
  }

  const aiMessage = result
    ? result.explanation || (
        result.drop > 15
          ? 'This decision would significantly impact your financial health. Consider waiting until your emergency fund reaches 3 months of expenses.'
          : result.drop > 5
            ? 'This decision has a moderate impact. Make sure your emergency fund is stable before proceeding.'
            : 'This decision has minimal financial impact given your current profile. You can proceed with confidence.'
      )
    : ''

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 md:pb-8 px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-[#334155]/50 rounded-lg text-[#94A3B8] hover:text-white transition-colors mr-1"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
            ⚡ Decision Engine
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Decision Simulator</h1>
        <p className="text-[#94A3B8]">See the impact of financial decisions before you make them</p>
      </motion.div>

      {/* Scenario grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {SCENARIOS.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleScenarioSelect(s)}
            className="card py-6 px-3 flex flex-col items-center gap-2 text-center transition-all duration-200"
            style={{
              borderColor: selected?.id === s.id ? '#22C55E' : '#334155',
              background: selected?.id === s.id ? 'rgba(34,197,94,0.06)' : '#1E293B',
            }}
          >
            <span className="text-3xl">{s.emoji}</span>
            <span className={`text-sm font-medium ${selected?.id === s.id ? 'text-[#22C55E]' : 'text-[#94A3B8]'}`}>
              {s.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Input Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="input-panel"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="card p-6 mb-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Scenario Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field" placeholder="e.g. Honda Activa" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Total Cost (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#22C55E] font-bold">₹</span>
                  <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    className="input-field pl-9" placeholder="80,000" />
                </div>
              </div>

              {/* Loan toggle */}
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-3">Paying with loan?</label>
                <div className="flex gap-3">
                  {[true, false].map(val => (
                    <button key={String(val)}
                      onClick={() => setForm(f => ({ ...f, isLoan: val }))}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border"
                      style={{
                        borderColor: form.isLoan === val ? '#22C55E' : '#334155',
                        color: form.isLoan === val ? '#22C55E' : '#94A3B8',
                        background: form.isLoan === val ? 'rgba(34,197,94,0.08)' : 'transparent',
                      }}>
                      {val ? 'Yes' : 'No (Cash)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan details slide-in */}
              <AnimatePresence>
                {form.isLoan && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Interest Rate (%)</label>
                      <input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
                        className="input-field" placeholder="10.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Duration (months)</label>
                      <input type="number" value={form.months} onChange={e => setForm(f => ({ ...f, months: e.target.value }))}
                        className="input-field" placeholder="24" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleSimulate}
                disabled={calculating || !form.cost}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {calculating ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader2 size={20} />
                  </motion.div> Calculating...</>
                ) : 'Simulate Impact ⚡'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Before / After */}
            <h2 className="text-lg font-bold text-white">📊 Impact Analysis</h2>
            <div className="flex items-stretch gap-3">
              {/* Before */}
              <motion.div
                className="card p-5 flex-1"
                animate={result.drop > 10 ? { borderColor: ['#334155', '#EF4444', '#334155'] } : {}}
                transition={{ duration: 1, repeat: result.drop > 10 ? 2 : 0 }}
              >
                <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-4">Before</p>
                <div className="space-y-4">
                  {[
                    { label: 'Health Score', before: result.before.overall, after: result.after.overall, suffix: '' },
                    { label: 'Savings Rate', before: result.before.savingsRate, after: result.after.savingsRate, suffix: '%' },
                  ].map(({ label, before }) => (
                    <div key={label}>
                      <p className="text-[#94A3B8] text-xs mb-1">{label}</p>
                      <p className="text-2xl font-bold text-white">{before}{label.includes('Rate') ? '%' : ''}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-1">Emergency Fund</p>
                    <p className="text-2xl font-bold text-white">{result.before.emfMonths} mo</p>
                  </div>
                </div>
              </motion.div>

              {/* Arrow */}
              <div className="flex items-center justify-center px-1">
                <div className="text-2xl text-[#94A3B8]">→</div>
              </div>

              {/* After */}
              <motion.div
                className="card p-5 flex-1"
                style={{ borderColor: result.drop > 10 ? '#EF444466' : result.drop < 0 ? '#22C55E66' : '#334155' }}
                animate={result.drop > 10 ? { borderColor: ['#334155', '#EF4444', '#EF444466'] } : {}}
                transition={{ duration: 1.5 }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-4"
                  style={{ color: result.drop > 10 ? '#EF4444' : result.drop < 0 ? '#22C55E' : '#F59E0B' }}>
                  After
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-1">Health Score</p>
                    <p className="text-2xl font-bold" style={{ color: getScoreColor(result.after.overall) }}>
                      <AnimatedNumber from={result.before.overall} to={result.after.overall} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-1">Savings Rate</p>
                    <p className="text-2xl font-bold" style={{ color: result.after.savingsRate < 15 ? '#EF4444' : '#22C55E' }}>
                      <AnimatedNumber from={result.before.savingsRate} to={result.after.savingsRate} />%
                    </p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-1">Emergency Fund</p>
                    <p className="text-2xl font-bold text-white">{result.after.emfMonths} mo</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {result.emi > 0 && (
              <div className="card px-5 py-4 flex items-center justify-between">
                <span className="text-[#94A3B8] text-sm">Monthly EMI added</span>
                <span className="text-white font-bold text-lg">{formatINR(result.emi)}/mo</span>
              </div>
            )}

            {/* Score delta badge */}
            <div className="flex items-center gap-3">
              <div className="card px-5 py-3 flex items-center gap-2 flex-1">
                <span className="text-[#94A3B8] text-sm">Score impact:</span>
                <span className="font-bold text-lg" style={{ color: result.drop > 0 ? '#EF4444' : '#22C55E' }}>
                  {result.drop > 0 ? '-' : '+'}{Math.abs(result.drop)} points
                </span>
              </div>
            </div>

            {/* AI card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
              style={{ borderColor: result.drop > 15 ? '#EF4444' : result.drop > 5 ? '#F59E0B' : '#22C55E',
                background: result.drop > 15 ? 'rgba(239,68,68,0.04)' : result.drop > 5 ? 'rgba(245,158,11,0.04)' : 'rgba(34,197,94,0.04)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: result.drop > 15 ? 'rgba(239,68,68,0.15)' : result.drop > 5 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)' }}>
                  🤖
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">FinCopilot's Assessment</p>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{aiMessage}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
