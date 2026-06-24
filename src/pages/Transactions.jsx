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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
          🧾 Transaction Log
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Transactions</h1>
        <p className="text-[#94A3B8] text-sm">Track your income and expenses in real time</p>
      </motion.div>

      {/* Add Transaction Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-6 mb-6">
        <h2 className="text-white font-bold mb-4">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'expense', label: '⬇ Expense', color: '#EF4444' },
              { val: 'income', label: '⬆ Income', color: '#22C55E' },
            ].map(({ val, label, color }) => (
              <button key={val} type="button" onClick={() => handleTypeChange(val)}
                className="py-3 rounded-xl font-semibold text-sm transition-all duration-200 border"
                style={{
                  borderColor: type === val ? color : '#334155',
                  color: type === val ? color : '#94A3B8',
                  background: type === val ? `${color}14` : 'transparent',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#22C55E] font-bold text-lg">₹</span>
            <input
              type="number" min="1" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="input-field pl-9 text-lg font-semibold" placeholder="0"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Category</label>
            <select value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field"
              style={{ background: '#1E293B', color: '#F8FAFC' }}>
              {categories.map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c] || '📌'} {c}</option>
              ))}
            </select>
          </div>

          {/* Description + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Description (optional)</label>
              <input value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field" placeholder="e.g. Swiggy Order" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="input-field"
                style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-base font-semibold">
            + Add Transaction
          </button>
        </form>
      </motion.div>

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-bold text-white mb-4">History
          <span className="text-[#94A3B8] text-sm font-normal ml-2">({transactions.length} total)</span>
        </h2>

        {transactions.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-white font-semibold mb-1">No transactions yet</p>
            <p className="text-[#94A3B8] text-sm">Add your first transaction above to get started</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([dateLabel, txs]) => (
              <div key={dateLabel}>
                <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-2">{dateLabel}</p>
                <div className="space-y-2">
                  {txs.map(tx => (
                    <AnimatePresence key={tx.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="card px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                          style={{ background: tx.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                          {CATEGORY_ICONS[tx.category] || '📌'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {tx.description || tx.category}
                          </p>
                          <p className="text-[#94A3B8] text-xs">{tx.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm" style={{ color: tx.type === 'income' ? '#22C55E' : '#EF4444' }}>
                            {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                          </p>
                        </div>
                        <button
                          onClick={() => confirmDelete(tx.id)}
                          className="ml-1 p-2 rounded-lg transition-all duration-200 flex-shrink-0"
                          style={{
                            background: deleting === tx.id ? 'rgba(239,68,68,0.15)' : 'transparent',
                            color: deleting === tx.id ? '#EF4444' : '#94A3B8',
                          }}
                          title={deleting === tx.id ? 'Tap again to confirm' : 'Delete'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
