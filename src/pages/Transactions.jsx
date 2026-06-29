import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { formatINR } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'

const CATEGORY_ICONS = {
  Salary: '💼', Freelancing: '💻', Business: '🏢', Income: '💰',
  Rent: '🏠', Food: '🍽️', Transport: '🚌', Shopping: '🛒',
  Entertainment: '🎬', Bills: '⚡', Education: '🎓', Healthcare: '🏥',
  Other: '📌',
}

const INCOME_CATEGORIES = ['Salary', 'Freelancing', 'Business', 'Other']
const EXPENSE_CATEGORIES = ['Rent', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Other']

const today = () => new Date().toISOString().split('T')[0]

function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function groupByDate(transactions) {
  const groups = {}
  transactions.forEach(tx => {
    const label = formatDateLabel(tx.date)
    if (!groups[label]) groups[label] = []
    groups[label].push(tx)
  })
  return groups
}

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useUser()
  const [type, setType] = useState('expense')
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: today() })
  const [deleting, setDeleting] = useState(null)

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleTypeChange = (t) => {
    setType(t)
    setForm(f => ({ ...f, category: t === 'income' ? 'Salary' : 'Food' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    addTransaction({ ...form, type, amount: Number(form.amount) })
    toast.success(`${type === 'income' ? 'Income' : 'Expense'} added!`)
    setForm({ amount: '', category: categories[0], description: '', date: today() })
  }

  const confirmDelete = (id) => {
    if (deleting === id) {
      deleteTransaction(id)
      toast.success('Transaction deleted')
      setDeleting(null)
    } else {
      setDeleting(id)
      setTimeout(() => setDeleting(null), 3000)
    }
  }

  const grouped = groupByDate(transactions)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 md:pb-8 px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="retro-badge" style={{ marginBottom: '8px' }}>
          🧾 Transaction Log
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Transactions
        </h1>
        <p style={{ color: '#4A3728', fontSize: '13px', marginTop: '4px' }}>Track your income and expenses in real time</p>
      </motion.div>

      {/* Add Transaction Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="retro-card">
          <div className="retro-titlebar">
            <span>➕ Add Transaction</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '16px', background: '#F0E8D8' }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'expense', label: '⬇ Expense' },
                  { val: 'income', label: '⬆ Income' },
                ].map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => handleTypeChange(val)}
                    className={`retro-btn ${
                      val === 'expense'
                        ? type === val ? 'retro-btn-red' : ''
                        : type === val ? 'retro-btn-green' : ''
                    } w-full`}
                    style={{ padding: '10px' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="relative">
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#2D6A2D', fontWeight: 700, fontSize: '18px' }}>₹</span>
                <input
                  type="number" min="1" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="retro-input"
                  style={{ paddingLeft: '28px', fontSize: '18px', fontWeight: 700 }}
                  placeholder="0"
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="retro-select">
                  {categories.map(c => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c] || '📌'} {c}</option>
                  ))}
                </select>
              </div>

              {/* Description + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description (optional)</label>
                  <input value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="retro-input" placeholder="e.g. Swiggy Order" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="retro-input" />
                </div>
              </div>

              <button type="submit" className="retro-btn retro-btn-green w-full" style={{ padding: '12px', fontSize: '14px' }}>
                + Add Transaction
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '18px', color: '#1A0A00', textTransform: 'uppercase' }}>History</h2>
          <span style={{ color: '#4A3728', fontSize: '13px' }}>({transactions.length} total)</span>
        </div>

        {transactions.length === 0 ? (
          <div className="retro-card">
            <div className="retro-titlebar">
              <span>📋 Transaction History</span>
              <span className="retro-controls" />
            </div>
            <div style={{ padding: '40px', background: '#F0E8D8', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧾</div>
              <p style={{ fontWeight: 700, color: '#1A0A00', marginBottom: '4px' }}>No transactions yet</p>
              <p style={{ color: '#4A3728', fontSize: '13px' }}>Add your first transaction above to get started</p>
            </div>
          </div>
        ) : (
          <div className="retro-card">
            <div className="retro-titlebar">
              <span>📋 Transaction History</span>
              <span className="retro-controls" />
            </div>
            <div style={{ background: '#F0E8D8' }}>
              {Object.entries(grouped).map(([dateLabel, txs]) => (
                <div key={dateLabel}>
                  {/* Date header */}
                  <div style={{
                    background: '#F5F5F0',
                    borderTop: '2px solid #2C1810',
                    borderBottom: '2px solid #2C1810',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#4A3728',
                  }}>
                    {dateLabel}
                  </div>
                  {txs.map((tx, index) => (
                    <AnimatePresence key={tx.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderBottom: '2px solid #F5F5F0',
                          background: index % 2 === 0 ? '#F0E8D8' : '#E8DCC8',
                          gap: '10px',
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                          background: tx.type === 'income' ? '#D4EDD4' : '#F8D7D0',
                          border: `2px solid ${tx.type === 'income' ? '#2D6A2D' : '#C0392B'}`,
                        }}>
                          {CATEGORY_ICONS[tx.category] || '📌'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: '#1A0A00', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tx.description || tx.category}
                          </p>
                          <p style={{ color: '#4A3728', fontSize: '11px' }}>{tx.category}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '14px', color: tx.type === 'income' ? '#2D6A2D' : '#C0392B' }}>
                            {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                          </p>
                        </div>
                        <button
                          onClick={() => confirmDelete(tx.id)}
                          style={{
                            padding: '6px',
                            background: deleting === tx.id ? '#F8D7D0' : 'transparent',
                            border: deleting === tx.id ? '2px solid #C0392B' : '2px solid transparent',
                            color: deleting === tx.id ? '#C0392B' : '#4A3728',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          title={deleting === tx.id ? 'Tap again to confirm' : 'Delete'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
