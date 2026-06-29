import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, BarChart2, Zap, Bot, TrendingUp, Target, Sparkles, ChevronRight, Circle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' } })
}

const steps = [
  { icon: Wallet, label: 'Tell us your finances', desc: 'Get started in under 2 minutes' },
  { icon: BarChart2, label: 'Get your Health Score', desc: 'Receive your personalized financial health score instantly' },
  { icon: Zap, label: 'Simulate decisions', desc: 'Test financial choices before you commit to them' },
  { icon: Bot, label: 'Get AI guidance', desc: 'Chat with your AI copilot for personalized money advice' },
]

const features = [
  { emoji: '📊', title: 'Financial Health Score', desc: 'Know exactly where you stand financially with a real-time score', titlebar: '' },
  { emoji: '⚡', title: 'Decision Simulator', desc: 'See the financial impact before you spend a single rupee', titlebar: 'retro-titlebar-red' },
  { emoji: '🤖', title: 'AI Copilot', desc: 'Ask anything about your money — get instant, personalized answers', titlebar: 'retro-titlebar-blue' },
  { emoji: '🎯', title: 'Goal Roadmaps', desc: 'Month-by-month plans that actually get you to your goals', titlebar: 'retro-titlebar-green' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: '#D4A843', borderBottom: '2.5px solid #2C1810', boxShadow: '0px 3px 0px #2C1810' }}
      >
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '20px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          💰 FinCopilot
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="retro-btn" style={{ padding: '6px 16px', fontSize: '12px' }}>Login</button>
          <button onClick={() => navigate('/login')} className="retro-btn retro-btn-green" style={{ padding: '6px 16px', fontSize: '12px' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{ background: '#D4A843', borderBottom: '4px solid #2C1810', padding: '120px 40px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* Retro grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(#2C1810 1px, transparent 1px), linear-gradient(90deg, #2C1810 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.06,
        }} />

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="inline-flex items-center gap-2 retro-badge mb-8"
          style={{ background: '#C0392B', color: '#F0E8D8', borderColor: '#2C1810', fontSize: '12px' }}>
          <Sparkles size={12} />
          AI-Powered Financial Copilot
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: 'clamp(32px, 5vw, 64px)', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1, marginBottom: '20px', maxWidth: '800px', margin: '0 auto 20px' }}>
          Your Financial Copilot for Smarter Money Decisions
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          style={{ fontFamily: 'Space Grotesk', fontSize: '18px', color: '#4A3728', maxWidth: '600px', margin: '0 auto 36px', fontWeight: 500, lineHeight: 1.6 }}>
          Understand your financial health, simulate major purchases, and get personalized AI guidance.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button
            onClick={() => navigate('/login')}
            className="retro-btn retro-btn-red"
            style={{ fontSize: '16px', padding: '14px 32px', marginBottom: '16px' }}
          >
            Build My Financial Profile <ChevronRight size={18} />
          </button>
          <p style={{ color: '#4A3728', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
            Build your financial profile in minutes • Instant financial insights • Free forever
          </p>
        </motion.div>

        {/* Floating score card preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
          className="retro-card mt-16 max-w-sm mx-auto"
          style={{ textAlign: 'left' }}
        >
          <div className="retro-titlebar">
            <span>📊 Financial Health Score</span>
            <span style={{ fontSize: '10px', color: '#1A0A00', fontWeight: 700, background: '#F0E8D8', border: '1px solid #2C1810', padding: '1px 6px' }}>LIVE DEMO</span>
          </div>
          <div style={{ padding: '20px', background: '#F0E8D8' }}>
            <div className="flex items-center gap-6">
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F5F5F0" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#2D6A2D" strokeWidth="3"
                    strokeDasharray="100" strokeDashoffset="28" strokeLinecap="round"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 28 }}
                    transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '20px', color: '#1A0A00' }}>72</span>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '22px', color: '#1A0A00' }}>72 / 100</p>
                <p style={{ color: '#2D6A2D', fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>Healthy ✓</p>
                <p style={{ color: '#4A3728', fontSize: '11px', marginTop: '4px' }}>Your overall financial health</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px', background: '#F5F5F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '32px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              How It Works
            </h2>
            <p style={{ color: '#4A3728', fontSize: '16px', fontWeight: 500 }}>Get started in under 2 minutes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="retro-card"
              >
                <div className="retro-titlebar" style={{ justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: '11px' }}>STEP 0{i + 1}</span>
                  <span className="retro-controls" />
                </div>
                <div style={{ padding: '20px', background: '#F0E8D8', textAlign: 'center' }}>
                  <div style={{
                    width: '52px', height: '52px', margin: '0 auto 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#E8DCC8', border: '2px solid #2C1810', boxShadow: '2px 2px 0px #2C1810',
                  }}>
                    <Icon size={24} color="#2D6A2D" />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#1A0A00', marginBottom: '6px', fontSize: '14px' }}>{label}</h3>
                  <p style={{ color: '#4A3728', fontSize: '12px', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: '#E8DCC8', borderTop: '2.5px solid #2C1810', borderBottom: '2.5px solid #2C1810' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '32px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Everything You Need
            </h2>
            <p style={{ color: '#4A3728', fontSize: '16px', fontWeight: 500 }}>Built specifically for young Indians navigating financial decisions</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(({ emoji, title, desc, titlebar }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="retro-card"
              >
                <div className={`retro-titlebar ${titlebar}`}>
                  <span>{emoji} {title}</span>
                  <span className="retro-controls" />
                </div>
                <div style={{ padding: '20px', background: '#F0E8D8' }}>
                  <p style={{ color: '#4A3728', lineHeight: 1.6, fontSize: '14px' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 24px', background: '#F5F5F0' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="retro-card"
          style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}
        >
          <div className="retro-titlebar-red retro-titlebar" style={{ justifyContent: 'center' }}>
            <span>🚀 Ready to Take Control?</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '48px 32px', background: '#F0E8D8' }}>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '32px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '16px' }}>
              Ready to take control?
            </h2>
            <p style={{ color: '#4A3728', fontSize: '16px', marginBottom: '28px', fontWeight: 500 }}>
              Join thousands of young Indians making smarter financial decisions.
            </p>
            <button onClick={() => navigate('/login')} className="retro-btn retro-btn-red" style={{ fontSize: '16px', padding: '14px 32px' }}>
              Get Started Now →
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', color: '#4A3728', fontSize: '12px', borderTop: '2.5px solid #2C1810', background: '#E8DCC8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <p>© 2025 FinCopilot. Built for young India. 🇮🇳</p>
      </footer>
    </motion.div>
  )
}
