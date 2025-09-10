'use client'

export default function ErrorPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Error</h1>
      <p>Sorry, something went wrong</p>
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <strong>Error:</strong> 500 - Internal Server Error
        </div>
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3e0', border: '1px solid #ff9800' }}>
          <strong>Message:</strong> Sorry an error has occured. Please try again later.
        </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ color: '#1976d2', textDecoration: 'underline' }}>
          Back to Login
        </a>
      </div>
    </div>
  )
}