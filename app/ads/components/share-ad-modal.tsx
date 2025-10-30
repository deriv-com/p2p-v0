"use client"

import { useRef } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import type { Ad } from "../types"
import { useToast } from "@/hooks/use-toast"

interface ShareAdModalProps {
  ad: Ad | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareAdModal({ ad, open, onOpenChange }: ShareAdModalProps) {
  const { toast } = useToast()
  const cardRef = useRef<HTMLDivElement>(null)

  if (!ad) return null

  const adType = ad.type || "Buy"
  const rate = ad.exchange_rate || ad.rate?.value || "N/A"
  const minAmount = ad.minimum_order_amount || (typeof ad.limits === "object" ? ad.limits.min : 0)
  const maxAmount = ad.actual_maximum_order_amount || (typeof ad.limits === "object" ? ad.limits.max : 0)
  const currency = ad.account_currency || "USD"

  // Generate shareable URL
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/ads/${ad.id}` : ""

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
            <span>Link copied to clipboard</span>
          </div>
        ),
        className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
        duration: 2500,
      })
    } catch (error) {
      toast({
        description: "Failed to copy link",
        variant: "destructive",
        duration: 2500,
      })
    }
  }

  const handleSaveImage = async () => {
    if (!cardRef.current) return

    try {
      // Use html2canvas to convert the card to an image
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `deriv-p2p-ad-${ad.id}.png`
          link.click()
          URL.revokeObjectURL(url)

          toast({
            description: (
              <div className="flex items-center gap-2">
                <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                <span>Image saved</span>
              </div>
            ),
            className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
            duration: 2500,
          })
        }
      })
    } catch (error) {
      toast({
        description: "Failed to save image",
        variant: "destructive",
        duration: 2500,
      })
    }
  }

  const handleShare = (platform: string) => {
    const text = `${adType} ${currency} on Deriv P2P - Rate: ${rate}`
    let url = ""

    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case "gmail":
        url = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(text)}&body=${encodeURIComponent(shareUrl)}`
        break
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-6">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-left">Share ad</DialogTitle>
          <DialogClose className="absolute right-0 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <Image src="/icons/close-icon.png" alt="Close" width={24} height={24} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="mt-6">
          {/* Ad Card */}
          <div ref={cardRef} className="relative bg-white p-6 rounded-lg overflow-hidden">
            {/* Red background section */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF444F] to-[#FF444F] h-[280px]" />

            {/* Gray diagonal section */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[140px] bg-[#F4F4F4]"
              style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)" }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Logo */}
              <div className="mb-6">
                <span className="text-white text-xl font-normal italic">deriv</span>
                <span className="text-white text-xl font-bold">P2P</span>
              </div>

              {/* Ad Type */}
              <div className="text-white text-2xl font-bold mb-6">
                {adType} {currency}
              </div>

              {/* Ad Details */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-normal min-w-[80px]">ID number</span>
                  <span className="text-white text-sm font-bold">{ad.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-normal min-w-[80px]">Limits</span>
                  <span className="text-white text-sm font-bold">
                    {minAmount.toFixed(2)} - {maxAmount.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-normal min-w-[80px]">Rate</span>
                  <span className="text-white text-sm font-bold">{rate}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-3">
                  <div className="w-[140px] h-[140px] bg-white flex items-center justify-center">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl)}`}
                      alt="QR Code"
                      width={140}
                      height={140}
                    />
                  </div>
                </div>
                <p className="text-gray-600 text-xs text-center">Scan this code to order via Deriv P2P</p>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => handleShare("whatsapp")}
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare("facebook")}
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Facebook</span>
            </button>

            <button
              onClick={() => handleShare("telegram")}
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-[#0088CC] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Telegram</span>
            </button>

            <button
              onClick={() => handleShare("twitter")}
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Twitter</span>
            </button>

            <button
              onClick={() => handleShare("gmail")}
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Gmail</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Image src="/icons/copy-icon.png" alt="Copy" width={20} height={20} />
              </div>
              <span className="text-xs text-gray-600">Copy link</span>
            </button>

            <button
              onClick={handleSaveImage}
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="#333" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Save image</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
