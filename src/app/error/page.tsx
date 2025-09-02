'use client'

import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  return (
    <div style={{ padding: '20px' }}>
      <h1>Error</h1>
      <p>Sorry, something went wrong</p>
      {error && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {message && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3e0', border: '1px solid #ff9800' }}>
          <strong>Message:</strong> {message}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ color: '#1976d2', textDecoration: 'underline' }}>
          Back to Login
        </a>
      </div>
    </div>
  )
}