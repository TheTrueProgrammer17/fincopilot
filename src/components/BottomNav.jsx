import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Zap, Bot, User, Receipt } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/simulator', icon: Zap, label: 'Simulator' },
  { to: '/transactions', icon: Receipt, label: 'Txns' },
  { to: '/chat', icon: Bot, label: 'Copilot' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: '#E8DCC8',
        borderTop: '2.5px solid #2C1810',
        boxShadow: '0px -3px 0px #2C1810',
      }}
    >
      <div className="flex items-center justify-around py-1 px-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 py-2 px-2 flex-1"
              style={{
                color: active ? '#1A0A00' : '#4A3728',
                borderTop: active ? '3px solid #D4A843' : '3px solid transparent',
                fontWeight: active ? 700 : 500,
              }}
            >
              <div className="relative">
                <Icon size={20} color={active ? '#2D6A2D' : '#4A3728'} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
