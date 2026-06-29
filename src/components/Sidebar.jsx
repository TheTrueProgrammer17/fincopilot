import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Zap, Receipt, Bot, User } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { calculateDashboardMetrics } from '../utils/helpers'
import { LogOut } from 'lucide-react'
import 'react-circular-progressbar/dist/styles.css'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/simulator', icon: Zap, label: 'Simulator' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/chat', icon: Bot, label: 'Copilot' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { user, transactions } = useUser()
  const { logout } = useAuth()
  const metrics = calculateDashboardMetrics(transactions, user)
  const score = metrics.scores.overall
  const scoreColor = score >= 70 ? '#2D6A2D' : score >= 40 ? '#D4A843' : '#C0392B'
  const scoreLabel = score >= 70 ? 'Healthy' : score >= 40 ? 'Needs Work' : 'At Risk'

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 z-50"
      style={{ background: '#E8DCC8', borderRight: '2.5px solid #2C1810', boxShadow: '4px 0px 0px #2C1810' }}
    >
      {/* Logo / Titlebar */}
      <div style={{ background: '#D4A843', borderBottom: '2.5px solid #2C1810', padding: '16px' }}>
        <span style={{
          fontFamily: "'Space Grotesk'",
          fontWeight: 800,
          fontSize: '20px',
          color: '#1A0A00',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'block',
        }}>
          💰 FinCopilot
        </span>
        <p style={{
          fontSize: '10px',
          color: '#4A3728',
          marginTop: '2px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          Financial Decision Engine
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all duration-100 uppercase tracking-wider ${
                isActive ? '' : ''
              }`
            }
            style={({ isActive }) => isActive ? {
              background: '#D4A843',
              border: '2px solid #2C1810',
              boxShadow: '2px 2px 0px #2C1810',
              color: '#1A0A00',
            } : {
              border: '2px solid transparent',
              color: '#4A3728',
            }}
            onMouseEnter={e => {
              if (!e.currentTarget.style.background.includes('#D4A843')) {
                e.currentTarget.style.background = '#F0E8D8'
                e.currentTarget.style.border = '2px solid #2C1810'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = ''
                e.currentTarget.style.border = '2px solid transparent'
              }
            }}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Health Score at bottom */}
      <div style={{ background: '#F0E8D8', borderTop: '2.5px solid #2C1810', padding: '16px' }}>
        <p style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#4A3728',
          marginBottom: '10px',
        }}>Financial Health</p>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex-shrink-0">
            <CircularProgressbar
              value={score}
              text={`${score}`}
              styles={buildStyles({
                textSize: '28px',
                textColor: '#1A0A00',
                pathColor: scoreColor,
                trailColor: '#F5F5F0',
              })}
            />
          </div>
          <div>
            <p style={{ color: '#1A0A00', fontWeight: 700, fontSize: '14px' }}>{user.name || 'Your Profile'}</p>
            <p style={{ fontSize: '11px', fontWeight: 700, color: scoreColor, textTransform: 'uppercase' }}>{scoreLabel}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 retro-btn w-full"
          style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
