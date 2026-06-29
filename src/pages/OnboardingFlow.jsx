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
      {label && (
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#2D6A2D', fontWeight: 700, fontSize: '18px' }}>₹</span>
        <input
          type="number" name={name} value={value || ''} onChange={onChange}
          placeholder={placeholder} min="0"
          className="retro-input"
          style={{ paddingLeft: '28px', fontSize: '18px', fontWeight: 700 }}
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
      style={{ background: '#F5F5F0' }}
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(200, 184, 154, 0.97)' }}
          >
            <div className="retro-card" style={{ padding: 0, textAlign: 'center' }}>
              <div className="retro-titlebar-green retro-titlebar" style={{ justifyContent: 'center' }}>
                <span>⚙ Generating Profile...</span>
              </div>
              <div style={{ padding: '48px 40px', background: '#F0E8D8' }}>
                <motion.div
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ display: 'inline-block', marginBottom: '20px' }}
                >
                  <Loader2 size={48} color="#2D6A2D" />
                </motion.div>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Generating your financial profile...
                </h2>
                <p style={{ color: '#4A3728', fontWeight: 500 }}>Calculating your scores across 4 dimensions</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{ maxWidth: '560px', margin: '0 auto', width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#4A3728', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step {step} of {TOTAL_STEPS}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2D6A2D' }}>{Math.round(progressPct)}% complete</span>
        </div>
        <div className="retro-progress-track">
          <motion.div
            className="retro-progress-fill green"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Step container */}
      <div style={{ maxWidth: '560px', margin: '0 auto', width: '100%' }}>
        <div className="retro-card">
          <div className="retro-titlebar">
            <span>📋 Setup — Step {step} of {TOTAL_STEPS}</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '24px', background: '#F0E8D8' }}>
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
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                    <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>
                      What's your monthly take-home salary?
                    </h1>
                    <p style={{ color: '#4A3728', marginBottom: '28px', fontWeight: 500 }}>After tax, before any deductions</p>
                    <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                      <RupeeInput name="income" value={data.income}
                        onChange={e => update('income', e.target.value)} placeholder="50,000" />
                    </div>
                  </div>
                )}

                {/* STEP 2 — Expenses */}
                {step === 2 && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧾</div>
                      <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>
                        Break down your monthly expenses
                      </h1>
                      <p style={{ color: '#4A3728', fontWeight: 500 }}>Approximate values are fine</p>
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
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏦</div>
                    <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>
                      How much do you have saved right now?
                    </h1>
                    <p style={{ color: '#4A3728', marginBottom: '8px', fontWeight: 500 }}>Include FD, savings account, cash</p>
                    <div style={{ maxWidth: '280px', margin: '24px auto 0' }}>
                      <RupeeInput name="savings" value={data.savings}
                        onChange={e => update('savings', e.target.value)} placeholder="1,00,000" />
                    </div>
                  </div>
                )}

                {/* STEP 4 — Loans */}
                {step === 4 && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                      <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>
                        Do you have any active loans or EMIs?
                      </h1>
                      <p style={{ color: '#4A3728', fontWeight: 500 }}>Personal loans, student loans, credit card EMIs, etc.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[true, false].map(val => (
                        <button
                          key={String(val)}
                          onClick={() => updateLoan('hasLoan', val)}
                          className={`retro-btn ${data.loans.hasLoan === val ? (val ? 'retro-btn-red' : 'retro-btn-green') : ''} w-full`}
                          style={{ padding: '20px', fontSize: '20px' }}
                        >
                          {val ? '✅ Yes' : '🚫 No'}
                        </button>
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
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                      <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>
                        What's your primary financial goal?
                      </h1>
                      <p style={{ color: '#4A3728', fontWeight: 500 }}>This shapes your personalised roadmap</p>
                    </div>
                    <div className="space-y-3">
                      {goals.map(({ id, emoji, label }) => (
                        <button
                          key={id}
                          onClick={() => update('goal', label)}
                          className="retro-card w-full text-left"
                          style={{ cursor: 'pointer', padding: 0 }}
                        >
                          <div className={`retro-titlebar ${data.goal === label ? 'retro-titlebar-green' : ''}`}
                            style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>{emoji}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700 }}>{label}</span>
                            </div>
                            {data.goal === label && <span style={{ fontSize: '12px' }}>✓ SELECTED</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={back} className="retro-btn flex items-center gap-2 px-6">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button onClick={next} className="retro-btn retro-btn-green flex-1 flex items-center justify-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} className="retro-btn retro-btn-green flex-1 flex items-center justify-center gap-2" style={{ padding: '14px', fontSize: '14px' }}>
                  Generate My Financial Profile →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
