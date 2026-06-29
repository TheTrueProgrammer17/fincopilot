import React from 'react'

export default function PageWrapper({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FDF3E7', color: '#1A0A00' }}>
      {children}
    </div>
  )
}
