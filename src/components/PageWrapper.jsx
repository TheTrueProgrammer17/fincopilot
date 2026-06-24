import React from 'react'

export default function PageWrapper({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC' }}>
      {children}
    </div>
  )
}
