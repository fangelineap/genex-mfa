'use client'

import Image from "next/image";
import { useState } from "react";
import QRCodeDisplay from "./components/QRCodeDisplay";
import { enableMFA, completeMFAEnrollment } from "./login/actions";

interface MFAData {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
  message: string;
}

export default function Home() {
  const [mfaData, setMfaData] = useState<MFAData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnrollmentComplete, setIsEnrollmentComplete] = useState(false);

  const handleEnableMFA = async () => {
    setIsLoading(true);
    // try {
    //   const response = await fetch('/api/enable-mfa', {
    //     method: 'POST',
    //   });
      
    //   if (response.ok) {
    //     const data = await response.json();
    //     console.log('MFA response:', data);
    //     setMfaData(data);
    //   } else {
    //     const error = await response.json();
    //     alert('Error enabling MFA: ' + error.message);
    //   }
    // } catch (error) {
    //   console.error("Error enabling MFA:", error);
    //   alert('Error enabling MFA. Check console for details.');
    // } finally {
    //   setIsLoading(false);
    // }

    const data = await enableMFA()

    if(data) {
      setMfaData(data);
    }

    setIsLoading(false);
  };

  const handleCompleteEnrollment = async (formData: FormData) => {
    setIsVerifying(true);
    setVerificationError('');

    const result = await completeMFAEnrollment(formData);
    
    if (result?.error) {
      setVerificationError(result.error);
    } else {
      setIsEnrollmentComplete(true);
    }
    
    setIsVerifying(false);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <button
            onClick={handleEnableMFA}
            disabled={isLoading}
            className="rounded-full border border-solid border-blue-500 transition-colors flex items-center justify-center bg-blue-500 text-white gap-2 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            {isLoading ? "⏳ Loading..." : "🔒 Enable MFA"}
          </button>
          <a
            href="/login"
            className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center hover:bg-gray-100 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Login
          </a>
        </div>

        {mfaData && !isEnrollmentComplete && (
          <div className="mt-8 w-full max-w-md">
            <QRCodeDisplay value={mfaData.uri} />
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800">📱 Complete MFA Setup</h4>
              <p className="text-sm text-blue-700 mt-2">
                After scanning the QR code, enter the 6-digit code from your authenticator app to complete setup.
              </p>
              
              <form action={handleCompleteEnrollment} className="mt-4 space-y-4">
                <input type="hidden" name="factorId" value={mfaData.factorId} />
                
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-blue-800">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    className="mt-1 block w-full px-3 py-2 text-center text-lg tracking-widest border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>

                {verificationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{verificationError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {isVerifying ? 'Verifying...' : 'Complete MFA Setup'}
                </button>
              </form>
            </div>
          </div>
        )}

        {isEnrollmentComplete && (
          <div className="mt-8 w-full max-w-md">
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
              <h4 className="font-semibold text-green-800">✅ MFA Setup Complete!</h4>
              <p className="text-sm text-green-700 mt-2">
                Your two-factor authentication has been successfully enabled. You'll now be prompted for a verification code when logging in.
              </p>
              <a
                href="/login"
                className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go to Login
              </a>
            </div>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
