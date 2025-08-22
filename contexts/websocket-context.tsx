"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { WebSocketClient, type WebSocketMessage, type WebSocketOptions } from "@/lib/websocket"

interface WebSocketContextType {
  isConnected: boolean
  sendMessage: (message: WebSocketMessage) => void
  joinChannel: (channel: string, id: number) => void
  leaveChannel: (channel: string) => void
  getChatHistory: (channel: string, orderId: string) => void
  reconnect: () => void
  subscribe: (callback: (data: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider")
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const wsClientRef = useRef<WebSocketClient | null>(null)
  const subscribersRef = useRef<Set<(data: any) => void>>(new Set())
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)

  useEffect(() => {
    console.log("[v0] WebSocketProvider initializing, iOS detected:", isIOS)

    const wsOptions: WebSocketOptions = {
      onOpen: (socket) => {
        console.log("[v0] WebSocket connection opened")
        setIsConnected(true)
        setConnectionAttempts(0)
      },
      onMessage: (data, socket) => {
        // Notify all subscribers
        subscribersRef.current.forEach((callback) => callback(data))
      },
      onClose: (event, socket) => {
        console.log("[v0] WebSocket connection closed")
        setIsConnected(false)
        setConnectionAttempts((prev) => prev + 1)
      },
      onError: (error, socket) => {
        console.error("[v0] WebSocket error:", error)
        setIsConnected(false)
      },
      autoReconnect: true,
      maxReconnectAttempts: isIOS ? 10 : 5,
      reconnectInterval: isIOS ? 5000 : 3000,
    }

    const wsClient = new WebSocketClient(wsOptions)
    wsClientRef.current = wsClient

    wsClient.connect().catch((error) => {
      console.error("[v0] Failed to connect to WebSocket:", error)
      setIsConnected(false)
    })

    const handleVisibilityChange = () => {
      if (isIOS && document.visibilityState === "visible" && !wsClient.isConnected()) {
        console.log("[v0] iOS app became visible, checking WebSocket connection")
        setTimeout(() => {
          if (!wsClient.isConnected()) {
            console.log("[v0] Reconnecting WebSocket after iOS app became visible")
            wsClient.connect().catch((err) => {
              console.error("[v0] Failed to reconnect after visibility change:", err)
            })
          }
        }, 1000)
      }
    }

    if (isIOS) {
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }

    return () => {
      if (isIOS) {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
      }
    }
  }, [isIOS])

  const sendMessage = (message: WebSocketMessage) => {
    if (wsClientRef.current) {
      wsClientRef.current.send(message)
    }
  }

  const joinChannel = (channel: string, id: number) => {
    if (wsClientRef.current) {
      wsClientRef.current.joinChannel(channel, id)
    }
  }

  const leaveChannel = (channel: string) => {
    if (wsClientRef.current) {
      wsClientRef.current.leaveChannel(channel)
    }
  }

  const getChatHistory = (channel: string, orderId: string) => {
    if (wsClientRef.current) {
      wsClientRef.current.getChatHistory(channel, orderId)
    }
  }

  const reconnect = () => {
    console.log("[v0] Manual reconnection requested")
    if (wsClientRef.current) {
      wsClientRef.current.disconnect()
      wsClientRef.current.connect().catch((error) => {
        console.error("[v0] Failed to reconnect to WebSocket:", error)
      })
    }
  }

  const subscribe = (callback: (data: any) => void) => {
    subscribersRef.current.add(callback)
    return () => {
      subscribersRef.current.delete(callback)
    }
  }

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
    joinChannel,
    leaveChannel,
    getChatHistory,
    reconnect,
    subscribe,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}
