"use client"

import Image from "next/image"

export function P2PAccessRemoved() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8">
          <Image
            src="/icons/illustration-blocked-users.svg"
            alt="P2P access removed"
            width={128}
            height={128}
          />
        </div>

        <h1 className="text-base font-bold text-slate-1200 mb-2">P2P access removed</h1>

        <p className="text-base text-slate-1200 mb-8">
          You can no longer use your Deriv P2P account. Check your email for more details. For support, reach out to us
          via live chat.
        </p>
      </div>
    </div>
  )
}
