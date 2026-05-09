import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/AppRoutes'
import { AuthProvider } from './features/auth'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
