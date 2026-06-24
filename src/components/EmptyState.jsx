import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

export default function EmptyState({ message = 'Complete your profile to see insights here.' }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      <div className="w-20 h-20 rounded-2xl bg-[#1E293B] border border-[#334155] flex items-center justify-center mb-6">
        <ClipboardList size={36} color="#22C55E" />
      </div>
      <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">No Profile Found</h2>
      <p className="text-[#94A3B8] mb-8 max-w-xs">{message}</p>
      <button
        onClick={() => navigate('/onboarding')}
        className="btn-primary px-8 py-3 text-base"
      >
        Complete Your Profile →
      </button>
    </motion.div>
  )
}
