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
import { PresenceLastSeen } from "@/components/presence-last-seen"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

type Message = {
  attachment: {
    name: string
    url: string
  } | null
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
  const { t, locale } = useTranslations()
  const { showAlert } = useAlertDialog()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maxLength = 300
  const maxFileSizeBytes = 5 * 1024 * 1024 // 5 MB

  const { isConnected, getChatHistory, subscribe } = useWebSocketContext()

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      if (data && data.payload && data.payload.data) {
        if (data.payload.data.chat_history && Array.isArray(data.payload.data.chat_history)) {
          setMessages((prev) => {
            const localRejected = prev.filter((msg) => msg.id.startsWith("local-rejected-"))
            return [...data.payload.data.chat_history, ...localRejected]
          })
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

  const showOrderTempLockedAlert = () => {
    showAlert({
      title: t("order.tempLockedTitle"),
      description: t("order.tempLockedDescription"),
      confirmText: t("order.tryAgain"),
      cancelText: t("order.goBack"),
      type: "warning",
    })
  }

  const handleSendMessage = async () => {
    if (message.trim() === "" || isSending) return

    setIsSending(true)

    const messageToSend = message
    setMessage("")

    try {
      await OrdersAPI.sendChatMessage(orderId, messageToSend, null)
    } catch (error) {
      if (error instanceof Error && error.message === "OrderTempLocked") {
        showOrderTempLockedAlert()
      } else if (error instanceof Error && error.message === "OrderChatMessageRejected") {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-rejected-${Date.now()}`,
            attachment: null,
            message: messageToSend,
            sender_is_self: true,
            time: Date.now(),
            rejected: true,
            tags: ["miscellaneous"],
          },
        ])
      }
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

  const showFileTooLargeDialog = () => {
    showAlert({
      title: t("chat.fileTooLargeTitle"),
      description: t("chat.fileTooLargeDescription"),
      confirmText: t("chat.chooseAnotherFile"),
      cancelText: t("common.cancel"),
      type: "warning",
      onConfirm: () => {
        fileInputRef.current?.click()
      },
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      if (file.size > maxFileSizeBytes) {
        if (fileInputRef.current) fileInputRef.current.value = ""
        showFileTooLargeDialog()
        return
      }

      setIsSending(true)

      try {
        const base64 = await fileToBase64(file)
        await OrdersAPI.sendChatMessage(orderId, "", base64)
      } catch (error) {
        if (error instanceof Error && error.message === "OrderChatFileSizeExceeded") {
          showFileTooLargeDialog()
        } else if (error instanceof Error && error.message === "OrderTempLocked") {
          showOrderTempLockedAlert()
        } else if (error instanceof Error && error.message === "OrderChatAttachmentRejected") {
          setMessages((prev) => [
            ...prev,
            {
              id: `local-rejected-${Date.now()}`,
              attachment: { name: file.name, url: "" },
              message: "",
              sender_is_self: true,
              time: Date.now(),
              rejected: true,
              tags: ["attachment_rejected"],
            },
          ])
        } else if (error instanceof Error && error.message === "ChatAttachmentLimitReached") {
          setMessages((prev) => [
            ...prev,
            {
              id: `local-rejected-${Date.now()}`,
              attachment: { name: file.name, url: "" },
              message: "",
              sender_is_self: true,
              time: Date.now(),
              rejected: true,
              tags: ["attachment_limit_reached"],
            },
          ])
        }
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

    return date.toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b flex-shrink-0">
        {onNavigateToOrderDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToOrderDetails}
            className="me-[16px] bg-grayscale-300 px-1"
          >
            <Image src="/icons/arrow-left-icon.png" alt={t("common.back")} width={24} height={24} className="rtl:rotate-180" />
          </Button>
        )}
        <div className="relative w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold me-3">
          {counterpartyInitial}
          <div
            className={`absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-white ${
              counterpartyOnlineStatus ? "bg-buy" : "bg-gray-400"
            }`}
          />
        </div>
        <div>
          <div className="font-medium">{counterpartyName}</div>
          {counterpartyOnlineStatus ? (
            <div className="text-xs text-slate-500">{t("chat.online")}</div>
          ) : (
            <PresenceLastSeen
              isOnline={counterpartyOnlineStatus}
              lastOnlineAt={counterpartyLastOnlineAt}
              className="text-xs text-slate-500"
            />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-[16px] m-[16px] bg-orange-50 rounded-[16px]">
          <div className="space-y-3">
            <div className="flex items-start gap-[8px]">
              <div className="flex-shrink-0">
                <Image src="/icons/warning-icon-new.png" className="-mt-[2px]" alt={t("common.warning")} width={24} height={24} />
              </div>
              <div className="text-sm text-slate-1200">
                <span className="font-bold">{t("chat.disclaimerImportant")}</span>
                <span className="ms-1">{t("chat.disclaimerText")}</span>
                <div className="mt-[16px]">
                  <span className="font-bold">{t("chat.disclaimerNote")}</span>
                  <span className="ms-1">{t("chat.disclaimerNoteText")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
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
                          <div className="flex items-center">
                            <div
                              className={`relative ${msg.sender_is_self ? "bg-slate-200" : "bg-slate-1700"} p-[16px] rounded-[8px] ${msg.rejected ? "opacity-50" : ""}`}
                            >
                              {!msg.sender_is_self && (
                                <div className="absolute ltr:left-0 rtl:right-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ltr:border-r-[8px] ltr:border-r-slate-1700 ltr:-translate-x-full rtl:border-l-[8px] rtl:border-l-slate-1700 rtl:translate-x-full" />
                              )}
                              {msg.sender_is_self && (
                                <div className="absolute ltr:right-0 rtl:left-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ltr:border-l-[8px] ltr:border-l-slate-200 ltr:translate-x-full rtl:border-r-[8px] rtl:border-r-slate-200 rtl:-translate-x-full" />
                              )}
                              <div className="bg-slate-75 p-[8px] rounded-[4px] text-xs">
                                {msg.rejected ? (
                                  <Image src="/icons/image-unavailable.svg" alt={t("common.error")} width={40} height={40} />
                                ) : (
                                  <a href={msg.attachment.url} target="_blank" download rel="noreferrer">
                                    {msg.attachment.name}
                                  </a>
                                )}
                              </div>
                            </div>
                            {msg.rejected && <Image src="/icons/info-icon.png" alt={t("common.error")} width={24} height={24} />}
                          </div>
                        )}
                        {msg.message && (
                          <div className="flex items-center">
                            <div
                              className={`relative break-words ${msg.sender_is_self ? (msg.rejected ? "bg-slate-200 opacity-50" : "bg-slate-200") : "bg-slate-1700"} p-[16px] rounded-[8px] flex-1`}
                            >
                              {!msg.sender_is_self && (
                                <div className="absolute ltr:left-0 rtl:right-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ltr:border-r-[8px] ltr:border-r-slate-1700 ltr:-translate-x-full rtl:border-l-[8px] rtl:border-l-slate-1700 rtl:translate-x-full" />
                              )}
                              {msg.sender_is_self && (
                                <div className="absolute ltr:right-0 rtl:left-0 top-[16px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ltr:border-l-[8px] ltr:border-l-slate-200 ltr:translate-x-full rtl:border-r-[8px] rtl:border-r-slate-200 rtl:-translate-x-full" />
                              )}
                              {msg.message}
                            </div>
                            {msg.rejected && <Image src="/icons/info-icon.png" alt={t("common.error")} width={24} height={24} />}
                          </div>
                        )}
                        {msg.rejected && msg.tags ? (
                          <div className="text-xs text-error-text mt-[4px]">
                            {msg.tags.includes("attachment_rejected")
                              ? t("chat.errorAttachmentRejected")
                              : msg.tags.includes("attachment_limit_reached")
                                ? t("chat.errorAttachmentLimitReached")
                                : t("chat.messageNotSent", { error: getChatErrorMessage(msg.tags, t) })}
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
        <div className="p-4 border-t text-center text-sm text-neutral-7 bg-slate-75 flex-shrink-0">
          {t("chat.conversationClosed")}
        </div>
      ) : (
        <div className="p-4 border-t bg-slate-75 flex-shrink-0">
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.enterMessage")}
                disabled={isSending}
                className="w-full rounded-[8px] pe-12 resize-none min-h-[56px] placeholder:text[#0000003D]"
              />
              {message.trim() ? (
                <Button
                  className="absolute end-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 h-auto"
                  onClick={handleSendMessage}
                  variant="ghost"
                  size="sm"
                  disabled={isSending}
                >
                  <Image src="/icons/send-message.png" alt={t("common.sendMessage")} width={20} height={20} className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  className="absolute end-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 h-auto"
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
              <div className="text-xs text-[#0000007A] me-4">
                {message.length}/{maxLength}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
