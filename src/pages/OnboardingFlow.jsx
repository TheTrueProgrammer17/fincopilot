import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useUser } from '../context/UserContext'
import { calculateScores } from '../utils/helpers'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const TOTAL_STEPS = 5

const goals = [
  { id: 'vehicle', emoji: '🚲', label: 'Buy a Vehicle' },
  { id: 'education', emoji: '🎓', label: 'Education / MBA' },
  { id: 'house', emoji: '🏠', label: 'House Down Payment' },
  { id: 'emergency', emoji: '🛡️', label: 'Build Emergency Fund' },
  { id: 'invest', emoji: '📈', label: 'Start Investing' },
]

function RupeeInput({ label, name, value, onChange, placeholder = '0' }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-[#94A3B8] mb-2">{label}</label>}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#22C55E] font-bold text-lg">₹</span>
        <input
          type="number" name={name} value={value || ''} onChange={onChange}
          placeholder={placeholder} min="0"
          className="input-field pl-9 text-lg font-semibold"
        />
      </div>
    </div>
  )
}

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const { updateUser } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState({
    income: '',
    expenses: { rent: '', food: '', transport: '', entertainment: '', other: '' },
    savings: '',
    loans: { hasLoan: false, amount: '', emi: '' },
    goal: '',
  })

  const update = (field, val) => setData(prev => ({ ...prev, [field]: val }))
  const updateExpense = (k, v) => setData(prev => ({ ...prev, expenses: { ...prev.expenses, [k]: v } }))
  const updateLoan = (k, v) => setData(prev => ({ ...prev, loans: { ...prev.loans, [k]: v } }))

  const next = () => {
    if (step === 1 && !data.income) { toast.error('Please enter your monthly income'); return }
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }
  const back = () => { if (step > 1) setStep(s => s - 1) }

  const handleSubmit = async () => {
    if (!data.goal) { toast.error('Please select a financial goal'); return }

    setLoading(true)
    const numIncome = Number(data.income)
    const numExpenses = {
      rent: Number(data.expenses.rent) || 0,
      food: Number(data.expenses.food) || 0,
      transport: Number(data.expenses.transport) || 0,
      entertainment: Number(data.expenses.entertainment) || 0,
      other: Number(data.expenses.other) || 0,
    }
    const numSavings = Number(data.savings) || 0
    const numLoans = {
      hasLoan: data.loans.hasLoan,
      amount: Number(data.loans.amount) || 0,
      emi: Number(data.loans.emi) || 0,
    }

    const scores = calculateScores({ income: numIncome, expenses: numExpenses, savings: numSavings, loans: numLoans })

    await new Promise(r => setTimeout(r, 1500))

    await updateUser({
      income: numIncome,
      expenses: numExpenses,
      savings: numSavings,
      loans: numLoans,
      goal: data.goal,
      scores,
    })

    toast.success('Financial profile generated!')
    navigate('/dashboard')
  }

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col px-4 py-8"
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.97)' }}
          >
            <motion.div
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="mb-6"
            >
              <Loader2 size={48} color="#22C55E" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Generating your financial profile...</h2>
            <p className="text-[#94A3B8]">Calculating your scores across 4 dimensions</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-lg mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#94A3B8] text-sm font-medium">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-[#22C55E] text-sm font-semibold">{Math.round(progressPct)}% complete</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#334155] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #22C55E, #4ade80)' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-lg mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 1 — Income */}
            {step === 1 && (
              <div className="text-center">
                <div className="text-5xl mb-4">💰</div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">What's your monthly take-home salary?</h1>
                <p className="text-[#94A3B8] mb-10">After tax, before any deductions</p>
                <div className="max-w-xs mx-auto">
                  <RupeeInput name="income" value={data.income}
                    onChange={e => update('income', e.target.value)} placeholder="50,000" />
                </div>
              </div>
            )}

            {/* STEP 2 — Expenses */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">🧾</div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Break down your monthly expenses</h1>
                  <p className="text-[#94A3B8]">Approximate values are fine</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(data.expenses).map(key => (
                    <RupeeInput
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      name={key}
                      value={data.expenses[key]}
                      onChange={e => updateExpense(key, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3 — Savings */}
            {step === 3 && (
              <div className="text-center">
                <div className="text-5xl mb-4">🏦</div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">How much do you have saved right now?</h1>
                <p className="text-[#94A3B8] mb-3">Include FD, savings account, cash</p>
                <div className="max-w-xs mx-auto mt-8">
                  <RupeeInput name="savings" value={data.savings}
                    onChange={e => update('savings', e.target.value)} placeholder="1,00,000" />
                </div>
              </div>
            )}

            {/* STEP 4 — Loans */}
            {step === 4 && (
              <div>
                <div className="text-center mb-10">
                  <div className="text-5xl mb-4">💳</div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Do you have any active loans or EMIs?</h1>
                  <p className="text-[#94A3B8]">Personal loans, student loans, credit card EMIs, etc.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[true, false].map(val => (
                    <motion.button
                      key={String(val)}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateLoan('hasLoan', val)}
                      className="card py-8 text-2xl font-bold transition-all duration-200"
                      style={{
                        borderColor: data.loans.hasLoan === val ? '#22C55E' : '#334155',
                        color: data.loans.hasLoan === val ? '#22C55E' : '#94A3B8',
                        background: data.loans.hasLoan === val ? 'rgba(34,197,94,0.08)' : '#1E293B',
                      }}
                    >
                      {val ? '✅ Yes' : '🚫 No'}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {data.loans.hasLoan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <RupeeInput label="Total Loan Amount" name="amount" value={data.loans.amount}
                        onChange={e => updateLoan('amount', e.target.value)} placeholder="5,00,000" />
                      <RupeeInput label="Monthly EMI" name="emi" value={data.loans.emi}
                        onChange={e => updateLoan('emi', e.target.value)} placeholder="10,000" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STEP 5 — Goal */}
            {step === 5 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">🎯</div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">What's your primary financial goal?</h1>
                  <p className="text-[#94A3B8]">This shapes your personalised roadmap</p>
                </div>
                <div className="space-y-3">
                  {goals.map(({ id, emoji, label }) => (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => update('goal', label)}
                      className="card w-full p-5 flex items-center gap-4 text-left transition-all duration-200"
                      style={{
                        borderColor: data.goal === label ? '#22C55E' : '#334155',
                        background: data.goal === label ? 'rgba(34,197,94,0.08)' : '#1E293B',
                      }}
                    >
                      <span className="text-3xl">{emoji}</span>
                      <span className={`font-semibold text-lg ${data.goal === label ? 'text-[#22C55E]' : 'text-white'}`}>
                        {label}
                      </span>
                      {data.goal === label && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="ml-auto w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="max-w-lg mx-auto w-full mt-10 flex gap-3">
        {step > 1 && (
          <button onClick={back} className="btn-outline flex items-center gap-2 px-6">
            <ChevronLeft size={18} /> Back
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 text-lg">
            Generate My Financial Profile →
          </button>
        )}
      </div>
    </motion.div>
  )
}
