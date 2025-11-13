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
        const advertiserId = ad.user?.id
        const adUrl = `${window.location.origin}/advertiser/${advertiserId}`
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
    const advertiserId = ad.user?.id
    const adUrl = `${window.location.origin}/advertiser/${advertiserId}`
    const text = `Hi! I'd like to exchange ${ad?.account_currency} at ${ad?.rate.value} on Deriv P2P. If you're interested, check out my ad ${adUrl}. Thanks!`
    const telegramText = `Hi! I'd like to exchange ${ad?.account_currency} at ${ad?.rate.value} on Deriv P2P. If you're interested, check out my ad. Thanks!`

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${adUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(adUrl)}&text=${encodeURIComponent(telegramText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(`${text}`)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank")
    }
  }

  const handleCopyLink = async () => {
    const advertiserId = ad.user?.id
    const adUrl = `${window.location.origin}/advertiser/${advertiserId}`
    try {
      await navigator.clipboard.writeText(adUrl)
      toast({
        description: (
          <div className="flex items-center gap-2">
            <img src="/icons/tick.svg" alt="Success" width={24} height={24} />
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
        useCORS: true,
        allowTaint: false,
      })

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
          },
          "image/png",
          1.0,
        )
      })

      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `deriv-p2p-ad-${ad.id}.png`

      link.style.display = "none"
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      toast({
        description: (
          <div className="flex items-center gap-2">
            <img src="/icons/tick.svg" alt="Success" width={24} height={24} />
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

    console.log("test");

     await new Promise((r) => setTimeout(r, 300)); 

    try {
      console.log(cardRef.current);

      // Capture div as canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
      });

      console.log("after html2canvas");

      // Convert to blob (JPEG reduces file size for iOS reliability)
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
          'image/jpeg',
          0.9 // reduce size
        );
      });

      const file = new File([blob], `deriv-p2p-ad-${ad.id}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      console.log("File size MB:", (file.size / 1024 / 1024).toFixed(2));
console.log("canShare?", navigator.canShare?.({ files: [file] }));

      

      // ✅ Check feature support
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${ad.type === 'buy' ? 'Buy' : 'Sell'} ${ad.account_currency} - Deriv P2P`,
          text: `Check out this ${ad.type === 'buy' ? 'Buy' : 'Sell'} ${ad.account_currency} ad on Deriv P2P`,
          //files: [file],
        });

        toast({
          description: (
            <div className="flex items-center gap-2">
              <img src="/icons/tick.svg" alt="Success" width={24} height={24} />
              <span>Shared successfully</span>
            </div>
          ),
          className: 'bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]',
          duration: 2500,
        });
        return;
      }

      // Fallback if cannot share
      await handleSaveImage();
    } catch (error) {
      console.error(error);
      toast({
        description: 'Failed to share image',
        variant: 'destructive',
      });
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
        <div className="flex items-center justify-end py-[12px] px-4 md:p-6 md:pb-4">
          <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <img src="/icons/close-icon.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto pb-32 md:pb-0">
          <h2 className="text-2xl font-bold px-4 md:px-0">Share ad</h2>
          <div className="flex items-center flex-col py-6 space-y-6 px-4 md:px-0">
            <div
              ref={cardRef}
              className="w-full md:w-[358px] bg-[linear-gradient(172deg,_#f4434f_73%,_rgba(0,0,0,0.04)_27%)] py-4 md:py-6 px-6 md:px-8 text-white"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/icons/p2p-logo-white.svg" alt="Deriv P2P" />
                </div>
                <div className="text-lg font-bold">
                  {ad.type === "buy" ? "Sell" : "Buy"} {ad.account_currency}
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="grid grid-cols-[85px_auto]">
                  <span className="text-sm">ID number</span>
                  <span className="font-bold text-sm">{ad.id}</span>
                </div>
                <div className="grid grid-cols-[85px_auto]">
                  <span className="text-sm">Limits</span>
                  <span className="font-bold text-sm">
                    {ad.limits.min} - {ad.limits.max} {ad.limits.currency}
                  </span>
                </div>
                <div className="grid grid-cols-[85px_auto]">
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
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" width={110} height={110} />
                  </div>
                  <p className="text-grayscale-text-muted text-xs mt-3 text-center">
                    Scan this code to order via Deriv P2P
                  </p>
                </>
              )}
            </div>
            {!isMobile && (
              <div className="flex gap-6">
                <Button
                  variant="ghost"
                  onClick={() => handleShare("whatsapp")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <img src="/icons/whatsapp.svg" alt="WhatsApp" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">WhatsApp</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleShare("facebook")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <img src="/icons/facebook.svg" alt="Facebook" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Facebook</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleShare("telegram")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <img src="/icons/telegram.svg" alt="Telegram" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Telegram</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleShare("gmail")}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <img src="/icons/google.svg" alt="Gmail" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Gmail</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <img src="/icons/link.svg" alt="link" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Copy link</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSaveImage}
                  className="flex flex-col items-center gap-2 rounded-lg transition-colors min-w-fit min-h-fit p-0 hover:bg-transparent"
                >
                  <div className="bg-[#F2F3F4] p-2 rounded-full flex items-center justify-center">
                    <img src="/icons/download.svg" alt="download" width={36} height={36} />
                  </div>
                  <span className="text-[10px] font-normal text-slate-1600">Save image</span>
                </Button>
              </div>
            )}
          </div>
        </div>
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 p-4 flex flex-col gap-2 max-w-xl mx-auto">
            <Button onClick={handleShareImage}>Share image</Button>
            <Button variant="outline" onClick={handleSaveImage}>
              Save image
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
