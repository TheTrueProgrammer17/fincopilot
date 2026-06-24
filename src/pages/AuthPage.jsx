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
        
        // Automatically create the user's profile record if needed
        if (newAuthUser) {
          const { supabase } = await import('../lib/supabase')
          await supabase.from('profiles').insert([{
            user_id: newAuthUser.id,
            name: form.name || form.email.split('@')[0],
            monthly_income: 0,
            health_score: 0
          }])
        }
        toast.success('Account created!')
        navigate('/dashboard')
      } else {
        await login(form.email, form.password)
        toast.success('Welcome back!')
        // Router will redirect based on profile existence automatically, but we can push to dashboard
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
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #22C55E, transparent)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #22C55E, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}>
              <Circle size={16} fill="#fff" color="#fff" />
            </div>
            <span className="text-2xl font-bold text-white">FinCopilot</span>
          </div>
          <p className="text-[#94A3B8]">Your AI-powered financial decision engine</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-8">
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: '#0F172A' }}>
            {['signup', 'login'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t ? 'bg-[#22C55E] text-white shadow-lg' : 'text-[#94A3B8] hover:text-white'
                }`}>
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
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Full Name</label>
                  <div className="relative">
                    <User size={16} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      name="name" type="text" value={form.name} onChange={handleChange}
                      placeholder="Rahul Sharma" className="input-field pl-10"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="rahul@example.com" className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
              <div className="relative">
                <Lock size={16} color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" className="input-field pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? 'Please wait...' : (tab === 'signup' ? 'Create Account →' : 'Login →')}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#334155]" />
            <span className="text-[#94A3B8] text-xs">or continue with</span>
            <div className="flex-1 h-px bg-[#334155]" />
          </div>

          <button
            onClick={() => toast('Google OAuth coming soon! 🚀', { icon: '🔐' })}
            className="btn-outline w-full py-3 flex items-center justify-center gap-2"
          >
            <Chrome size={18} />
            Continue with Google
          </button>
        </motion.div>

        <p className="text-center text-[#94A3B8] text-xs mt-6">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </motion.div>
  )
}
