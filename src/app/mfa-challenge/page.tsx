'use client'

import { useEffect, useState } from 'react'
import { unenrollMFA, verifyMFAWithChallenge } from '@/app/login/actions'
import { redirect } from 'next/navigation'

export default function MFAChallenge() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError('')
    
    const result = await verifyMFAWithChallenge(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If successful, verifyMFAWithChallenge will redirect
  }

  const handleUnenroll = async () => {
     setLoading(true)
    setError('')
    
    const result = await unenrollMFA()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If successful, verifyMFA will redirect
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          
          <div>
            <label htmlFor="code" className="sr-only">
              Authentication Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              className="relative block w-full rounded-md border-0 py-1.5 px-3 text-center text-2xl tracking-widest text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        <form action={handleUnenroll}>
          <div>
            <button
              type="submit"
              // disabled={loading || code.length !== 6 || !challengeId}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
            >
              Unenroll
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}