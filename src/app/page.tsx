'use client'

import Image from "next/image";
import { useState } from "react";
import QRCodeDisplay from "./components/QRCodeDisplay";
import { enableMFA } from "./login/actions";

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

        {mfaData && (
          <div className="mt-8 w-full max-w-md">
            <QRCodeDisplay value={mfaData.uri} />
            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
              <h4 className="font-semibold text-green-800">✅ MFA Enabled Successfully!</h4>
              <p className="text-sm text-green-700 mt-2">{mfaData.message}</p>
              <p className="text-xs text-green-600 mt-2">
                Factor ID: <span className="font-mono">{mfaData.factorId}</span>
              </p>
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
