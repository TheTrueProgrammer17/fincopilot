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
  const scoreColor = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444'
  const scoreLabel = score >= 70 ? 'Healthy' : score >= 40 ? 'Needs Work' : 'At Risk'

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 z-50"
      style={{ background: '#1E293B', borderRight: '1px solid #334155' }}>

      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid #334155' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-white font-bold text-lg tracking-tight">FinCopilot</span>
        </div>
        <p className="text-[#94A3B8] text-xs mt-1">Financial Decision Engine</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-green-400'
                  : 'text-[#94A3B8] hover:text-white'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.2)',
            } : {
              border: '1px solid transparent',
            }}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Health Score at bottom */}
      <div className="px-4 py-5" style={{ borderTop: '1px solid #334155' }}>
        <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-3">Financial Health</p>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex-shrink-0">
            <CircularProgressbar
              value={score}
              text={`${score}`}
              styles={buildStyles({
                textSize: '28px',
                textColor: scoreColor,
                pathColor: scoreColor,
                trailColor: '#334155',
              })}
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{user.name || 'Your Profile'}</p>
            <p className="text-xs font-medium" style={{ color: scoreColor }}>{scoreLabel}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="mt-4 flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors w-full p-2 rounded-md hover:bg-[#334155]"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
