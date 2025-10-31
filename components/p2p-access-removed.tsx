"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function P2PAccessRemoved() {
  const handleLiveChat = () => {
    if (typeof window !== "undefined" && (window as any).LC_API) {
      ;(window as any).LC_API.open_chat_window()
  } else {
      window.open("https://deriv.com/contact-us/", "_blank")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-12">
      <div className="flex flex-col items-center max-w-[600px] text-center">
        <div className="mb-8">
          <Image
            src="/icons/illustration-blocked-users.svg"
            alt="P2P access removed"
            width={200}
            height={200}
            className="w-[200px] h-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-slate-1200 mb-4">P2P access removed</h1>

        <p className="text-base text-slate-600 mb-8 leading-relaxed">
          You can no longer use your Deriv P2P account. Check your email for more details. For support, reach out to us
          via live chat.
        </p>

        <Button onClick={handleLiveChat} className="bg-[#FF444F] hover:bg-[#FF444F]/90 text-white px-8 py-6 text-base">
          <Image src="/icons/chat-white.jpg" alt="Chat" width={20} height={20} className="mr-2" />
          Live chat
        </Button>
      </div>
    </div>
  )
}
