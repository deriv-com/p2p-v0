"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import html2canvas from "html2canvas"
import type { Ad } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

interface ShareAdPageProps {
  ad: Ad
  onClose: () => void
}

export default function ShareAdPage({ ad, onClose }: ShareAdPageProps) {
  const { toast } = useToast()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true)
        const adUrl = `${window.location.origin}/ads/${ad.id}`
        const qrCode = await QRCode.toDataURL(adUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
        setQrCodeUrl(qrCode)
      } catch (error) {
        console.error("Error generating QR code:", error)
        toast({
          description: "Failed to generate QR code",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    generateQRCode()
  }, [ad.id, toast])

  const handleShare = async (platform: string) => {
    const adUrl = `${window.location.origin}/advertiser/${ad.user.id}`
    const text = `Check out this ${ad?.type === "buy" ? "Buy" : "Sell"} ${ad?.account_currency} ad on Deriv P2P`

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${adUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(adUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(adUrl)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(adUrl)}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(adUrl)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank")
    }
  }

  const handleCopyLink = async () => {
    const adUrl = `${window.location.origin}/ads/${ad.id}`
    try {
      await navigator.clipboard.writeText(adUrl)
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image src="/icons/tick.svg" alt="Success" width={24} height={24} />
            <span>Ad link copied</span>
          </div>
        ),
        className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
        duration: 2500,
      })
    } catch (error) {
      toast({
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleSaveImage = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })

      const link = document.createElement("a")
      link.download = `deriv-p2p-ad-${ad.id}.png`
      link.href = canvas.toDataURL()
      link.click()

      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image src="/icons/tick.svg" alt="Success" width={24} height={24} />
            <span>Image saved successfully</span>
          </div>
        ),
        className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
        duration: 2500,
      })
    } catch (error) {
      toast({
        description: "Failed to save image",
        variant: "destructive",
      })
    }
  }

  const handleShareImage = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        })
      })

      const file = new File([blob], `deriv-p2p-ad-${ad.id}.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${ad.type === "buy" ? "Buy" : "Sell"} ${ad.account_currency} - Deriv P2P`,
          text: `Check out this ${ad.type === "buy" ? "Buy" : "Sell"} ${ad.account_currency} ad on Deriv P2P`,
        })

        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/tick.svg" alt="Success" width={24} height={24} />
              <span>Shared successfully</span>
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
        })
      } else {
        handleSaveImage()
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          description: "Failed to share image",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="mt-2 text-slate-600">Loading ads...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex flex-col h-full max-w-xl mx-auto">
        <div className="flex items-center justify-end p-6 pb-4">
          <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <Image src="/icons/close-icon.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold">Share ad</h2>
          <div className="flex items-center flex-col py-6 space-y-6">
            <div
              ref={cardRef}
              className="w-full md:w-[358px] bg-[linear-gradient(172deg,_#f4434f_73%,_rgba(0,0,0,0.04)_27%)] py-6 px-8 text-white"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/icons/p2p-logo-white.svg" alt="Deriv P2P" />
                </div>
                <div className="text-lg font-bold">
                  {ad.type === "buy" ? "Buy" : "Sell"} {ad.account_currency}
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="grid grid-cols-2">
                  <span className="text-sm">ID number</span>
                  <span className="font-bold text-sm">{ad.id}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm">Limits</span>
                  <span className="font-bold text-sm">
                    {ad.limits.min} - {ad.limits.max} {ad.limits.currency}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm">Rate</span>
                  <span className="font-bold text-sm">
                    {ad.exchange_rate_type === "float"
                      ? `${ad.exchange_rate > 0 ? "+" : ""}${ad.exchange_rate}%`
                      : ad.rate.value}
                  </span>
                </div>
              </div>

              {qrCodeUrl && (
                <>
                  <div className="bg-white rounded-lg p-2 flex flex-col items-center w-fit mx-auto">
                    <Image src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" width={110} height={110} />
                  </div>
                  <p className="text-grayscale-text-muted text-xs mt-3 text-center">
                    Scan this code to order via Deriv P2P
                  </p>
                </>
              )}
            </div>
            {isMobile ? (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleShareImage}
                >Share image
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveImage}>Save image</Button>
              </div>
            ) : (
              <div className="flex gap-6">
                <Button
                  variant="ghost"
                  onClick={() => handleShare("whatsapp")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">WhatsApp</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleShare("facebook")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <Image src="/icons/facebook.svg" alt="Facebook" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Facebook</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleShare("telegram")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <Image src="/icons/telegram.svg" alt="Telegram" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Telegram</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleShare("twitter")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <Image src="/icons/x.svg" alt="Twitter" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Twitter</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleShare("gmail")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <Image src="/icons/google.svg" alt="Gmail" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Gmail</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <Image src="/icons/link.svg" alt="link" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Copy link</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSaveImage}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <Image src="/icons/download.svg" alt="download" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Save image</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
