"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { getWebSocketClient, type WebSocketMessage, type WebSocketOptions } from "@/lib/websocket"
import { useUserDataStore } from "@/stores/user-data-store"

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
  const subscribersRef = useRef<Set<(data: any) => void>>(new Set())
  const socketToken = useUserDataStore((state) => state.socketToken)
  const hasInitializedRef = useRef(false)

  const subscribe = (callback: (data: any) => void) => {
    subscribersRef.current.add(callback)
    return () => {
      subscribersRef.current.delete(callback)
    }
  }

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true

      const wsOptions: WebSocketOptions = {
        onOpen: (socket) => {
          console.log("[v0] WebSocket connected")
          setIsConnected(true)
        },
        onMessage: (data, socket) => {
          subscribersRef.current.forEach((callback) => callback(data))
        },
        onClose: (event, socket) => {
          console.log("[v0] WebSocket disconnected")
          setIsConnected(false)
        },
        onError: (error, socket) => {
          console.error("[v0] WebSocket error:", error)
        },
      }

      const wsClient = getWebSocketClient(wsOptions)

      if (socketToken) {
        wsClient.connect().catch((error) => {
          console.error("[v0] Failed to connect to WebSocket:", error)
        })
      }
    }

    if (socketToken && hasInitializedRef.current) {
      const wsClient = getWebSocketClient()
      if (!wsClient.isConnected()) {
        console.log("[v0] Token available, connecting WebSocket")
        wsClient.connect().catch((error) => {
          console.error("[v0] Failed to connect to WebSocket:", error)
        })
      }
    }
  }, [socketToken])

  const sendMessage = (message: WebSocketMessage) => {
    const wsClient = getWebSocketClient()
    wsClient.send(message)
  }

  const joinChannel = (channel: string, id: number) => {
    const wsClient = getWebSocketClient()
    wsClient.joinChannel(channel, id)
  }

  const leaveChannel = (channel: string, id: number) => {
    const wsClient = getWebSocketClient()
    wsClient.leaveChannel(channel, id)
  }

  const getChatHistory = (channel: string, orderId: string) => {
    const wsClient = getWebSocketClient()
    wsClient.getChatHistory(channel, orderId)
  }

  const reconnect = () => {
    const wsClient = getWebSocketClient()
    wsClient.disconnect()
    wsClient.connect().catch((error) => {
      console.error("Failed to reconnect to WebSocket:", error)
    })
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
