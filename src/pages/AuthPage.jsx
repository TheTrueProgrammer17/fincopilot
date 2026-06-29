import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Chrome, Circle } from 'lucide-react'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signup, login } = useAuth()
  const { user } = useUser()
  const [tab, setTab] = useState('signup')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (tab === 'signup' && !form.name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!form.email.trim()) { toast.error('Please enter your email'); return }
    if (!form.password.trim()) { toast.error('Please enter a password'); return }

    setLoading(true)
    try {
      if (tab === 'signup') {
        const { user: newAuthUser } = await signup(form.email, form.password)
        
        if (newAuthUser) {
          const { supabase } = await import('../lib/supabase')
          const { error: profileError } = await supabase.from('profiles').insert([{
            user_id: newAuthUser.id,
            name: form.name || form.email.split('@')[0],
            monthly_income: 0,
            health_score: 0
          }])
          if (profileError) {
            console.error('Failed to create profile record:', profileError.message)
          }
        }
        toast.success('Account created!')
        navigate('/dashboard')
      } else {
        await login(form.email, form.password)
        toast.success('Welcome back!')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F5F5F0' }}
    >
      {/* Background decoration — retro grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(#2C1810 1px, transparent 1px), linear-gradient(90deg, #2C1810 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.04,
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            💰 FinCopilot
          </span>
          <p style={{ color: '#4A3728', fontSize: '13px', fontWeight: 500, marginTop: '4px' }}>Your AI-powered financial decision engine</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="retro-card">
          <div className="retro-titlebar-blue retro-titlebar">
            <span>🔐 {tab === 'login' ? 'Login' : 'Create Account'}</span>
            <span className="retro-controls" />
          </div>
          <div style={{ padding: '24px', background: '#F0E8D8' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#F5F5F0', border: '2.5px solid #2C1810', padding: '4px' }}>
              {['signup', 'login'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontFamily: "'Space Grotesk'",
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    border: tab === t ? '2px solid #2C1810' : '2px solid transparent',
                    background: tab === t ? '#F39C12' : 'transparent',
                    color: tab === t ? '#F0E8D8' : '#4A3728',
                    boxShadow: tab === t ? '2px 2px 0px #2C1810' : 'none',
                  }}>
                  {t === 'signup' ? 'Sign Up' : 'Login'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {tab === 'signup' && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                    <div className="relative">
                      <User size={14} color="#4A3728" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        name="name" type="text" value={form.name} onChange={handleChange}
                        placeholder="Rahul Sharma" className="retro-input" style={{ paddingLeft: '32px' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                <div className="relative">
                  <Mail size={14} color="#4A3728" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="rahul@example.com" className="retro-input" style={{ paddingLeft: '32px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <div className="relative">
                  <Lock size={14} color="#4A3728" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input name="password" type="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••" className="retro-input" style={{ paddingLeft: '32px' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="retro-btn retro-btn-blue w-full" style={{ padding: '12px', fontSize: '14px' }}>
                {loading ? 'Please wait...' : (tab === 'signup' ? 'Create Account →' : 'Login →')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '2px', background: '#2C1810' }} />
              <span style={{ color: '#4A3728', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
              <div style={{ flex: 1, height: '2px', background: '#2C1810' }} />
            </div>

            <button
              onClick={() => toast('Google OAuth coming soon! 🚀', { icon: '🔐' })}
              className="retro-btn w-full"
              style={{ padding: '10px' }}
            >
              <Chrome size={16} />
              Continue with Google
            </button>
          </div>
        </motion.div>

        <p style={{ textAlign: 'center', color: '#4A3728', fontSize: '11px', marginTop: '16px', fontWeight: 600 }}>
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </motion.div>
  )
}
