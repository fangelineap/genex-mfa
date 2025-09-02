'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export default function QRCodeDisplay({ value, size = 256 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error)
        }
      })
    }
  }, [value, size])

  if (!value) {
    return <div>No QR code data available</div>
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold">Scan with your authenticator app</h3>
      <canvas ref={canvasRef} />
      <div className="text-sm text-gray-600 max-w-md text-center">
        <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-600">Manual entry</summary>
          <p className="mt-2 font-mono text-xs break-all bg-gray-100 p-2 rounded">
            {value}
          </p>
        </details>
      </div>
    </div>
  )
}