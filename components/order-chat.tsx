"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { OrdersAPI } from "@/services/api"
import { useWebSocketContext } from "@/contexts/websocket-context"
import { getChatErrorMessage, formatTime } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/use-translations"

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
  counterpartyOnlineStatus?: boolean
  counterpartyLastOnlineAt?: number
}

export default function OrderChat({
  orderId,
  counterpartyName,
  counterpartyInitial,
  isClosed,
  onNavigateToOrderDetails,
  counterpartyOnlineStatus,
  counterpartyLastOnlineAt,
}: OrderChatProps) {
  const { t } = useTranslations()
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
          if (newMessage.order_id == orderId) {
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

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((msg) => {
      const date = new Date(msg.time)
      const dateKey = date.toDateString()

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(msg)
    })

    return groups
  }

  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString)

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
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
        <div className="relative w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold mr-3">
          {counterpartyInitial}
          <div
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
              counterpartyOnlineStatus ? "bg-buy" : "bg-gray-400"
            }`}
          />
        </div>
        <div>
          <div className="font-medium">{counterpartyName}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>
              {counterpartyOnlineStatus
                ? t("chat.online")
                : counterpartyLastOnlineAt
                  ? `Seen ${formatLastSeen(counterpartyLastOnlineAt, t)}`
                  : t("chat.offline")}
            </span>
          </div>
        </div>
      </div>
      <div className=""h-full overflow-auto">
        <div className="p-[16px] m-[16px] bg-orange-50 rounded-[16px]">
          <div className="space-y-3">
            <div className="flex items-start gap-[8px]">
              <div className="flex-shrink-0">
                <Image src="/icons/warning-icon-new.png" className="-mt-[2px]" alt="Warning" width={24} height={24} />
              </div>
              <div className="text-sm text-slate-1200">
                <span className="font-bold">{t("chat.disclaimerImportant")}</span>
                <span className="ml-1">{t("chat.disclaimerText")}</span>
                <div className="mt-[16px]">
                  <span className="font-bold">{t("chat.disclaimerNote")}</span>
                  <span className="ml-1">{t("chat.disclaimerNoteText")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
            </div>
          ) : (
            <>
              {Object.entries(groupMessagesByDate(messages)).map(([dateKey, dateMessages]) => (
                <div key={dateKey}>
                  <div className="flex justify-center my-4">
                    <div className="text-grayscale-text-muted text-xs px-3 py-1 rounded-full">
                      {formatDateHeader(dateKey)}
                    </div>
                  </div>
                  {dateMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_is_self ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%] rounded-lg pb-[16px]">
                        {msg.attachment && (
                          <div
                            className={`relative ${msg.sender_is_self ? "bg-slate-200" : "bg-slate-1700"} p-[16px] rounded-[8px]`}
                          >
                            {!msg.sender_is_self && (
                              <div className="absolute left-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-slate-1700 -translate-x-full" />
                            )}
                            {msg.sender_is_self && (
                              <div className="absolute right-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-slate-200 translate-x-full" />
                            )}
                            <div className="bg-slate-75 p-[8px] rounded-[4px] text-xs">
                              <a href={msg.attachment.url} target="_blank" download rel="noreferrer">
                                {msg.attachment.name}
                              </a>
                            </div>
                          </div>
                        )}
                        {msg.message && (
                          <div className="flex items-center">
                            <div
                              className={`relative break-words ${msg.sender_is_self ? (msg.rejected ? "bg-slate-200 opacity-50" : "bg-slate-200") : "bg-slate-1700"} p-[16px] rounded-[8px] flex-1`}
                            >
                              {!msg.sender_is_self && (
                                <div className="absolute left-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-slate-1700 -translate-x-full" />
                              )}
                              {msg.sender_is_self && (
                                <div className="absolute right-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-slate-200 translate-x-full" />
                              )}
                              {msg.message}
                            </div>
                            {msg.rejected && <Image src="/icons/info-icon.png" alt="Error" width={24} height={24} />}
                          </div>
                        )}
                        {msg.rejected && msg.tags ? (
                          <div className="text-xs text-error-text mt-[4px]">
                            {t("chat.messageNotSent", { error: getChatErrorMessage(msg.tags, t) })}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "text-xs mt-1 text-grayscale-text-muted justify-self-start",
                              msg.sender_is_self && "justify-self-end",
                            )}
                          >
                            {msg.time && formatTime(msg.time)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {isClosed ? (
        <div className="p-4 border-t text-center text-sm text-neutral-7 bg-slate-75">
          {t("chat.conversationClosed")}
        </div>
      ) : (
        <div className="p-4 border-t bg-slate-75">
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.enterMessage")}
                disabled={isSending}
                className="w-full rounded-[8px] pr-12 resize-none min-h-[56px] placeholder:text[#0000003D]"
              />
              {message.trim() ? (
                <Button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 h-auto"
                  onClick={handleSendMessage}
                  variant="ghost"
                  size="sm"
                  disabled={isSending}
                >
                  <Image src="/icons/send-message.png" alt="Send message" width={20} height={20} className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 h-auto"
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                >
                  <Image src="/icons/paperclip-icon.png" alt="Attach file" width={20} height={20} className="h-5 w-5" />
                </Button>
              )}
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
              <div className="text-xs text-[#0000007A] mr-16px">
                {message.length}/{maxLength}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatLastSeen(
  timestamp: number,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const now = Date.now()
  const lastSeenDate = new Date(timestamp)
  const diffMs = now - lastSeenDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return t("chat.justNow")
  if (diffMins < 60) {
    return t("chat.seenMinutesAgo", {
      minutes: diffMins.toString(),
      plural: diffMins === 1 ? "" : "s",
    })
  }
  if (diffHours < 24) {
    return t("chat.seenHoursAgo", {
      hours: diffHours.toString(),
      plural: diffHours === 1 ? "" : "s",
    })
  }
  if (diffDays < 7) {
    return t("chat.seenDaysAgo", {
      days: diffDays.toString(),
      plural: diffDays === 1 ? "" : "s",
    })
  }

  return lastSeenDate.toLocaleDateString()
}
