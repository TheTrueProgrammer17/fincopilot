import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from './context/UserContext'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingFlow from './pages/OnboardingFlow'
import Dashboard from './pages/Dashboard'
import Simulator from './pages/Simulator'
import Copilot from './pages/Copilot'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'

function AnimatedRoutes() {
  const location = useLocation()
  const showNav = ['/dashboard', '/simulator', '/chat', '/profile'].includes(location.pathname)

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/chat" element={<Copilot />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AnimatedRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </UserProvider>
  )
}
