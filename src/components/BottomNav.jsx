import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Zap, Bot, User, Receipt } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/simulator', icon: Zap, label: 'Simulator' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/chat', icon: Bot, label: 'Copilot' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid #334155' }}>
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <NavLink key={to} to={to} className="flex flex-col items-center gap-1 py-1 px-3 flex-1">
              <div className="relative">
                <Icon size={22} color={active ? '#22C55E' : '#94A3B8'} strokeWidth={active ? 2.2 : 1.8} />
                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#22C55E]"
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-[#22C55E]' : 'text-[#94A3B8]'}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
