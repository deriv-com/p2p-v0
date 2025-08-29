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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maxLength = 300

  const { isConnected, getChatHistory, subscribe } = useWebSocketContext()

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      if (data && data.payload && data.payload.data) {
        if (data.payload.data.chat_history && Array.isArray(data.payload.data.chat_history)) {
          setMessages(data.payload.data.chat_history)
        }

        if (data.payload.data.message || data.payload.data.attachment) {
          const newMessage = data.payload.data
          if(newMessage.order_id == orderId) {
            setMessages((prev) => {
                return [...prev, newMessage]
            })
          }
        }

        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [subscribe])

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        getChatHistory("orders", orderId)
      }, 100)
    }
  }, [isConnected, getChatHistory, orderId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (message.trim() === "" || isSending) return

    setIsSending(true)

    try {
      const messageToSend = message
      setMessage("")

      await OrdersAPI.sendChatMessage(orderId, messageToSend, null)
    } catch (error) {
      console.log(error)
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

      setIsSending(true)

      try {
        const base64 = await fileToBase64(file)
        await OrdersAPI.sendChatMessage(orderId, "", base64)
      } catch (error) {
        console.error("Error sending file:", error)
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
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
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
          <div className="text-sm text-slate-500">Seen {formatLastSeen(new Date())}</div>
        </div>
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
      ) : (
        <div className="p-4 border-t bg-slate-75">
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                onKeyDown={handleKeyDown}
                placeholder="Enter message"
                disabled={isSending}
                className="w-full rounded-[8px] pr-12 resize-none min-h-[56px] placeholder:text[#0000003D]"
              />
              <Button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 h-auto"
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
              >
                <Image src="/icons/paperclip-icon.png" alt="Attach file" width={20} height={20} className="h-5 w-5" />
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf"
              />
            </div>
            <div className="flex justify-between items-center">
              <div></div>
              <div className="text-xs text-[##0000007A] mr-16px">
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
