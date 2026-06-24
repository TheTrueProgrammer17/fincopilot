import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'
import { formatINR, buildProfile, calculateDashboardMetrics } from '../utils/helpers'
import { Send, Bot, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SUGGESTIONS = [
  'Should I start a SIP?',
  'Can I afford a new bike?',
  'Should I take a personal loan?',
  'How much rent can I afford in Bangalore?',
  'How much emergency fund do I need?',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <Bot size={16} color="#22C55E" />
      </div>
      <div className="card px-5 py-4 max-w-xs">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="typing-dot"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s', animationName: 'typing-bounce', animationIterationCount: 'infinite' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Copilot() {
  const navigate = useNavigate()
  const { user, hasProfile, transactions } = useUser()
  const { user: authUser } = useAuth()
  const metrics = calculateDashboardMetrics(transactions, user)
  const defaultMessage = {
    role: 'ai',
    text: `👋 Hi${user.name ? ' ' + user.name : ''}! I'm FinCopilot, your personal financial advisor. Ask me anything about your money, investments, or financial decisions. I'll give you advice tailored to your profile.`,
  }
  const [messages, setMessages] = useState([defaultMessage])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!authUser) return;
    const loadChat = async () => {
      const { data } = await supabase.from('chats').select('messages').eq('user_id', authUser.id).single()
      if (data && data.messages && data.messages.length > 0) {
        setMessages(data.messages)
        setStarted(true)
      } else {
        // try local storage as fallback
        const local = localStorage.getItem('fincopilot_chat')
        if (local) {
          const parsed = JSON.parse(local)
          setMessages(parsed)
          setStarted(true)
          saveChat(parsed)
        }
      }
    }
    loadChat()
  }, [authUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const saveChat = async (msgs) => {
    if (!authUser) return;
    localStorage.setItem('fincopilot_chat', JSON.stringify(msgs))
    const { data: existing } = await supabase.from('chats').select('id').eq('user_id', authUser.id).single()
    if (existing) {
      await supabase.from('chats').update({ messages: msgs }).eq('user_id', authUser.id)
    } else {
      await supabase.from('chats').insert([{ user_id: authUser.id, messages: msgs }])
    }
  }

  const API_BASE = 'http://localhost:8000/api'

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setStarted(true)
    
    const newMessages = [...messages, { role: 'user', text: msg }]
    setMessages(newMessages)
    await saveChat(newMessages)
    setTyping(true)

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: buildProfile(user),
          metrics_summary: {
            monthly_income: metrics.monthlyIncome,
            monthly_expenses: metrics.monthlyExpenses,
            net_savings: metrics.netSavings,
            savings_rate: metrics.savingsRate,
            health_score: metrics.scores.overall,
            emergency_fund_months: metrics.emfMonths,
            top_spending_categories: Object.fromEntries(
              Object.entries(metrics.categorySpend).sort(([,a],[,b]) => b-a).slice(0,3)
            ),
            transaction_count: transactions.length
          },
          message: msg,
          conversation_history: messages.map(m => ({ role: m.role, content: m.text }))
        })
      })
      const data = await res.json()
      setTyping(false)
      const aiResponse = [...newMessages, { role: 'ai', text: data.response }]
      setMessages(aiResponse)
      await saveChat(aiResponse)
    } catch (e) {
      setTyping(false)
      const errorMsg = e instanceof TypeError 
        ? 'Network error: Make sure the backend is running on port 8000 and CORS is properly configured.'
        : 'Sorry, I ran into an error processing your request.'
      const errResponse = [...newMessages, { role: 'ai', text: errorMsg }]
      setMessages(errResponse)
      await saveChat(errResponse)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col h-screen pb-16 md:pb-0"
      style={{ background: '#0F172A' }}
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #334155', background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(12px)' }}>
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-[#334155]/50 rounded-lg text-[#94A3B8] hover:text-white transition-colors mr-1"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Bot size={20} color="#22C55E" />
        </div>
        <div>
          <h1 className="text-white font-bold">🤖 FinCopilot</h1>
          <p className="text-[#94A3B8] text-xs">Always answers based on your financial profile</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse-slow" />
          <span className="text-[#22C55E] text-xs font-medium">Online</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {/* Suggestions */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <p className="text-[#94A3B8] text-sm text-center mb-4">Suggested questions</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map(s => (
                  <motion.button
                    key={s} whileTap={{ scale: 0.96 }}
                    onClick={() => sendMessage(s)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:border-[#22C55E]/50"
                    style={{ background: '#1E293B', border: '1px solid #334155', color: '#94A3B8' }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Bot size={16} color="#22C55E" />
              </div>
            )}
            <div
              className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={msg.role === 'user'
                ? { background: '#22C55E', color: '#fff', borderBottomRightRadius: 4 }
                : { background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC', borderBottomLeftRadius: 4 }
              }
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid #334155', background: '#1E293B' }}>
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your money..."
            className="flex-1 bg-transparent outline-none text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
            style={{ border: 'none' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
            style={{ background: '#22C55E' }}
          >
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
