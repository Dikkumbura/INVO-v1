import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './router'
import { AuthProvider } from './context/AuthContext'
import { ClaimProvider } from './context/ClaimContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ClaimProvider>
        <RouterProvider router={router} />
      </ClaimProvider>
    </AuthProvider>
  </React.StrictMode>
)