'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '8px' }}>CommHub</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>AI-powered client communication for your dev team</p>
        <button
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          style={{ padding: '10px 24px', background: '#24292f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Sign in with GitHub
        </button>
      </div>
    </main>
  )
}
