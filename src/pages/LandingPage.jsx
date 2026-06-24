import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, BarChart2, Zap, Bot, TrendingUp, Target, Sparkles, ChevronRight, Circle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' } })
}

const steps = [
  { icon: Wallet, label: 'Tell us your finances', desc: 'Provide your income, expenses & goals — no bank linking' },
  { icon: BarChart2, label: 'Get your Health Score', desc: 'Receive your personalized financial health score instantly' },
  { icon: Zap, label: 'Simulate decisions', desc: 'Test financial choices before you commit to them' },
  { icon: Bot, label: 'Get AI guidance', desc: 'Chat with your AI copilot for personalized money advice' },
]

const features = [
  { emoji: '📊', title: 'Financial Health Score', desc: 'Know exactly where you stand financially with a real-time score' },
  { emoji: '⚡', title: 'Decision Simulator', desc: 'See the financial impact before you spend a single rupee' },
  { emoji: '🤖', title: 'AI Copilot', desc: 'Ask anything about your money — get instant, personalized answers' },
  { emoji: '🎯', title: 'Goal Roadmaps', desc: 'Month-by-month plans that actually get you to your goals' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}>
            <Circle size={14} fill="#fff" color="#fff" />
          </div>
          <span className="text-xl font-bold text-white">FinCopilot</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-outline text-sm px-5 py-2">Login</button>
          <button onClick={() => navigate('/login')} className="btn-primary text-sm px-5 py-2">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)' }} />

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}>
          <Sparkles size={14} />
          AI-Powered Financial Copilot
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 max-w-4xl">
          Your Financial Copilot for{' '}
          <span className="gradient-text">Smarter Money</span> Decisions
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-lg md:text-xl text-[#94A3B8] mb-10 max-w-2xl leading-relaxed">
          Current finance apps tell you where your money went.{' '}
          <span className="text-[#F8FAFC] font-medium">We help you decide where your money should go next.</span>
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col items-center gap-4">
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary text-lg px-10 py-4 flex items-center gap-2 glow-green"
          >
            Build My Financial Profile <ChevronRight size={20} />
          </button>
          <p className="text-[#94A3B8] text-sm">No bank linking required • Takes less than 2 minutes • Free forever</p>
        </motion.div>

        {/* Floating score card preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
          className="mt-16 card px-8 py-6 max-w-sm w-full mx-auto relative"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8] text-sm font-medium">Financial Health Score</span>
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>Live Demo</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="#22C55E" strokeWidth="3"
                  strokeDasharray="100" strokeDashoffset="28" strokeLinecap="round"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 28 }}
                  transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">72</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">72 / 100</p>
              <p className="text-[#22C55E] text-sm font-medium mt-0.5">Healthy ✓</p>
              <p className="text-[#94A3B8] text-xs mt-1">Your overall financial health</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-[#94A3B8] text-lg">Get started in under 2 minutes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center group hover:border-[#22C55E]/40 transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))' }}>
                  <Icon size={26} color="#22C55E" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#334155] text-[#94A3B8] text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-white mb-2">{label}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" style={{ background: 'rgba(30,41,59,0.3)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-[#94A3B8] text-lg">Built specifically for young Indians navigating financial decisions</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ emoji, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="card p-8 flex gap-5 cursor-default group hover:border-[#22C55E]/30 transition-all duration-300"
              >
                <div className="text-4xl flex-shrink-0">{emoji}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center card p-12"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(30,41,59,1))', borderColor: 'rgba(34,197,94,0.2)' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Make Your First Smart <span className="gradient-text">Financial Decision</span>
          </h2>
          <p className="text-[#94A3B8] mb-8 text-lg">Join thousands of young Indians taking control of their finances.</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary text-lg px-10 py-4">
            Get Started — It's Free →
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-[#94A3B8] text-sm border-t border-[#334155]">
        <p>© 2025 FinCopilot. Built for young India. 🇮🇳</p>
      </footer>
    </motion.div>
  )
}
