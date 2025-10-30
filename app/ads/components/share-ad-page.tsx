"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import html2canvas from "html2canvas"
import { AdsAPI } from "@/services/api"
import type { Ad } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface ShareAdPageProps {
  adId: string
  onClose: () => void
}

export default function ShareAdPage({ adId, onClose }: ShareAdPageProps) {
  const { toast } = useToast()
  const [ad, setAd] = useState<Ad | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setIsLoading(true)
        const response = await AdsAPI.getAdvert(adId)
        if (response.data) {
          setAd(response.data)
          const adUrl = `${window.location.origin}/ads/${adId}`
          const qrCode = await QRCode.toDataURL(adUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          })
          setQrCodeUrl(qrCode)
        }
      } catch (error) {
        console.error("Error fetching ad:", error)
        toast({
          description: "Failed to load ad details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAd()
  }, [adId, toast])

  const handleShare = async (platform: string) => {
    const adUrl = `${window.location.origin}/ads/${adId}`
    const text = `Check out this ${ad?.type === "buy" ? "Buy" : "Sell"} ${ad?.payment_currency} ad on Deriv P2P`

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${adUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(adUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(adUrl)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(adUrl)}`,
      gmail: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(adUrl)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank")
    }
  }

  const handleCopyLink = async () => {
    const adUrl = `${window.location.origin}/ads/${adId}`
    try {
      await navigator.clipboard.writeText(adUrl)
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image src="/icons/tick.svg" alt="Success" width={24} height={24} />
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
      link.download = `deriv-p2p-ad-${adId}.png`
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <Image src="/icons/back-arrow.svg" alt="Back" width={20} height={20} />
          </Button>
          <h1 className="text-xl font-bold">Share ad</h1>
        </div>
        <div className="flex items-center justify-center flex-1">
          <Image src="/icons/spinner.png" alt="Loading" width={40} height={40} className="animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 max-w-xl mx-auto flex flex-col w-full h-full">
      <div className="flex items-center justify-end p-6 pb-4">
        <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
          <Image src="/icons/close-icon.png" alt="Close" width={24} height={24} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[620px] mx-auto px-6 py-6 space-y-6">
          <div ref={cardRef} className="bg-primary py-6 px-8 text-white">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-lg">deriv</span>
                <span className="text-lg">P2P</span>
              </div>
              <h2 className="text-2xl font-bold">
                {ad.type === "buy" ? "Buy" : "Sell"} {ad.payment_currency}
              </h2>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="opacity-90">ID number</span>
                <span className="font-semibold">{ad.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Limits</span>
                <span className="font-semibold">
                  {ad.minimum_order_amount} - {ad.maximum_order_amount} {ad.payment_currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Rate</span>
                <span className="font-semibold">
                  {ad.exchange_rate_type === "float"
                    ? `${ad.exchange_rate > 0 ? "+" : ""}${ad.exchange_rate}%`
                    : ad.exchange_rate}
                </span>
              </div>
            </div>

            {qrCodeUrl && (
              <>
                <div className="bg-white rounded-lg p-4 flex flex-col items-center w-fit mx-auto">
                  <Image src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
                </div>
                <p className="text-gray-600 text-sm mt-3 text-center">Scan this code to order via Deriv P2P</p>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Button
              variant="ghost"
              onClick={() => handleShare("whatsapp")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">WhatsApp</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleShare("facebook")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Facebook</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleShare("telegram")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Telegram</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleShare("twitter")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Twitter</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleShare("gmail")}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#EA4335] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Gmail</span>
            </Button>

            <Button
              variant="ghost"
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Copy link</span>
            </Button>

            <Button
              variant="ghost"
              onClick={handleSaveImage}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="7 10 12 15 17 10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs text-gray-700">Save image</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
