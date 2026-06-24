import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navigate } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingFlow from './pages/OnboardingFlow'
import Dashboard from './pages/Dashboard'
import Simulator from './pages/Simulator'
import Copilot from './pages/Copilot'
import Profile from './pages/Profile'
import Transactions from './pages/Transactions'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'

const APP_PATHS = ['/dashboard', '/simulator', '/chat', '/profile', '/transactions']

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { hasProfile, loadingData } = useUser()
  const location = useLocation()

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Bypassing forced onboarding for Hackathon MVP
  // if (!hasProfile && location.pathname !== '/onboarding') {
  //   return <Navigate to="/onboarding" replace />
  // }

  return children
}

function AnimatedRoutes() {
  const location = useLocation()
  const isApp = APP_PATHS.includes(location.pathname)

  return (
    <div className={isApp ? 'min-h-screen bg-[#0F172A]' : ''}>
      {isApp && <Sidebar />}
      <div className={isApp ? 'md:ml-60' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Copilot /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
      {isApp && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}
