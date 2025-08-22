"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrdersAPI } from "@/services/api"
import { useWebSocketContext } from "@/contexts/websocket-context"
import { getChatErrorMessage, formatDateTime } from "@/lib/utils"

type Message = {
  attachment: {
    name: string
    url: string
  }
  id: string
  message: string
  sender_is_self: boolean
  time: number
  rejected: boolean
  tags: string[]
}

type OrderChatProps = {
  orderId: string
  counterpartyName: string
  counterpartyInitial: string
  isClosed: boolean
  onNavigateToOrderDetails: () => void
}

export default function OrderChat({
  orderId,
  counterpartyName,
  counterpartyInitial,
  isClosed,
  onNavigateToOrderDetails,
}: OrderChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxLength = 300

  const { isConnected, getChatHistory, subscribe, reconnect } = useWebSocketContext()

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)

  useEffect(() => {
    console.log("[v0] Chat component mounted, iOS detected:", isIOS)
    console.log("[v0] Initial connection status:", isConnected)

    setConnectionStatus(isConnected ? "connected" : "disconnected")
    setDebugInfo(`iOS: ${isIOS}, Connected: ${isConnected}, Order: ${orderId}`)
  }, [isConnected, isIOS, orderId])

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      console.log("[v0] WebSocket message received:", data)

      if (data && data.payload && data.payload.data) {
        if (data.payload.data.chat_history && Array.isArray(data.payload.data.chat_history)) {
          console.log("[v0] Chat history received, messages count:", data.payload.data.chat_history.length)
          setMessages(data.payload.data.chat_history)
        }

        if (data.payload.data.message || data.payload.data.attachment) {
          const newMessage = data.payload.data
          console.log("[v0] New message received for order:", newMessage.order_id, "current order:", orderId)
          if (newMessage.order_id == orderId) {
            setMessages((prev) => {
              return [...prev, newMessage]
            })
          }
        }

        setIsLoading(false)
        setConnectionStatus("connected")
      } else {
        console.log("[v0] Invalid message format received")
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [subscribe, orderId])

  useEffect(() => {
    console.log("[v0] Connection status changed:", isConnected)

    if (isConnected) {
      const delay = isIOS ? 500 : 100
      setTimeout(() => {
        console.log("[v0] Requesting chat history after", delay, "ms delay")
        getChatHistory("orders", orderId)
      }, delay)

      setConnectionStatus("connected")
    } else {
      setConnectionStatus("disconnected")

      if (isIOS && retryTimeoutRef.current === null) {
        console.log("[v0] iOS detected, setting up auto-retry for WebSocket")
        retryTimeoutRef.current = setTimeout(() => {
          console.log("[v0] Attempting WebSocket reconnection for iOS")
          reconnect()
          retryTimeoutRef.current = null
        }, 2000)
      }
    }
  }, [isConnected, getChatHistory, orderId, reconnect, isIOS])

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (message.trim() === "" || isSending) return

    console.log("[v0] Sending message:", message.substring(0, 50) + "...")
    setIsSending(true)
    const messageToSend = message // Declare messageToSend variable

    try {
      setMessage("")

      await OrdersAPI.sendChatMessage(orderId, messageToSend, null)
      console.log("[v0] Message sent successfully")
    } catch (error) {
      console.log("[v0] Error sending message:", error)
      setMessage(messageToSend)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      console.log("[v0] File selected:", file.name, "size:", file.size, "type:", file.type)

      if (isIOS && file.size > 10 * 1024 * 1024) {
        // 10MB limit for iOS
        console.log("[v0] File too large for iOS:", file.size)
        alert("File size too large. Please select a file smaller than 10MB.")
        return
      }

      setIsSending(true)

      try {
        console.log("[v0] Converting file to base64...")
        const base64 = await fileToBase64(file)
        console.log("[v0] File converted, sending...")
        await OrdersAPI.sendChatMessage(orderId, "", base64)
        console.log("[v0] File sent successfully")
      } catch (error) {
        console.error("[v0] Error sending file:", error)
        alert("Failed to send file. Please try again.")
      } finally {
        setIsSending(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        console.log("[v0] FileReader onload completed")
        resolve(reader.result as string)
      }
      reader.onerror = (error) => {
        console.log("[v0] FileReader error:", error)
        reject(error)
      }
      if (isIOS) {
        setTimeout(() => {
          if (reader.readyState === FileReader.LOADING) {
            console.log("[v0] FileReader timeout on iOS")
            reader.abort()
            reject(new Error("File reading timeout"))
          }
        }, 30000) // 30 second timeout for iOS
      }
    })
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center p-4 border-b">
        {onNavigateToOrderDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToOrderDetails}
            className="mr-[16px] bg-grayscale-300 px-1"
          >
            <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
          </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold mr-3">
          {counterpartyInitial}
        </div>
        <div>
          <div className="font-medium">{counterpartyName}</div>
          <div className="text-sm text-slate-500">
            {connectionStatus === "connected"
              ? `Seen ${formatLastSeen(new Date())}`
              : `Connection: ${connectionStatus}`}
          </div>
        </div>
        {process.env.NODE_ENV === "development" && <div className="ml-auto text-xs text-gray-400">{debugInfo}</div>}
      </div>
      <div className="h-full overflow-auto">
        <div className="p-[16px] m-[16px] bg-orange-50 rounded-[16px]">
          <div className="space-y-3">
            <div className="flex items-start gap-[8px]">
              <div className="flex-shrink-0">
                <Image src="/icons/warning-icon-new.png" className="-mt-[2px]" alt="Warning" width={24} height={24} />
              </div>
              <div className="text-sm text-grayscale-100">
                <span className="font-bold">Important:</span>
                <span className="ml-1">
                  Deriv will never contact you via WhatsApp to ask for your personal information. Always ignore any
                  messages from numbers claiming to be from Deriv.
                </span>
                <div className="mt-[16px]">
                  <span className="font-bold">Note:</span>
                  <span className="ml-1">In case of a dispute, we'll use this chat as a reference.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-slate-600 ml-2">Loading chat... ({connectionStatus})</p>
            </div>
          ) : connectionStatus === "disconnected" ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="text-center">
                <p className="text-slate-600 mb-4">Connection lost. Trying to reconnect...</p>
                <Button onClick={reconnect} variant="outline" size="sm">
                  Retry Connection
                </Button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_is_self ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] rounded-lg pb-[16px]">
                  {msg.attachment && (
                    <div className={`${msg.sender_is_self ? "bg-primary" : "bg-gray-400"} p-[16px] rounded-[8px]`}>
                      <div
                        className={`${msg.sender_is_self ? "opacity-70" : ""} bg-white p-[8px] rounded-[4px] text-xs`}
                      >
                        <a href={msg.attachment.url} target="_blank" download rel="noreferrer">
                          {msg.attachment.name}
                        </a>
                      </div>
                    </div>
                  )}
                  {msg.message && (
                    <div className="flex items-center">
                      <div
                        className={`break-words ${msg.sender_is_self ? (msg.rejected ? "bg-blue-200 opacity-50" : "bg-primary") : "bg-gray-400"} p-[16px] rounded-[8px] flex-1`}
                      >
                        {msg.message}
                      </div>
                      {msg.rejected && <Image src="/icons/info-icon.png" alt="Error" width={24} height={24} />}
                    </div>
                  )}
                  {msg.rejected && msg.tags ? (
                    <div className="text-xs text-error-text mt-[4px]">
                      Message not sent: {getChatErrorMessage(msg.tags)}
                    </div>
                  ) : (
                    <div
                      className={`text-xs mt-1 ${msg.sender_is_self ? "text-default-button-text text-right" : "text-neutral-7"}`}
                    >
                      {msg.time && formatDateTime(msg.time)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isClosed ? (
        <div className="p-4 border-t text-center text-sm text-neutral-7 bg-[#0000000A]">
          This conversation is closed.
        </div>
      ) : connectionStatus === "disconnected" ? (
        <div className="p-4 border-t text-center text-sm text-neutral-7 bg-[#0000000A]">Reconnecting to chat...</div>
      ) : (
        <div className="p-4 border-t">
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                onKeyDown={handleKeyDown}
                placeholder="Enter message"
                disabled={isSending || connectionStatus !== "connected"}
                className="w-full bg-[#0000000A] rounded-[8px] pr-12 resize-none min-h-[56px] placeholder:text[#0000003D]"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
              />
              <Button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 h-auto"
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                disabled={isSending || connectionStatus !== "connected"}
              >
                <Image src="/icons/paperclip-icon.png" alt="Attach file" width={20} height={20} className="h-5 w-5" />
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf"
                capture={isIOS ? "environment" : undefined}
              />
            </div>
            <div className="flex justify-between items-center">
              <div></div>
              <div className="text-xs text-[#0000003D] mr-16px">
                {message.length}/{maxLength}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatLastSeen(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`

  return date.toLocaleDateString()
}
