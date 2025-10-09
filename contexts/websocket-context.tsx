"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import { getWebSocketClient } from "@/lib/websocket"
import type { WebSocketMessage } from "./websocket-message"

interface WebSocketContextType {
  isConnected: boolean
  joinChannel: (channel: string, id: number) => void
  leaveChannel: (channel: string) => void
  getChatHistory: (channel: string, orderId: string) => void
  subscribe: (callback: (data: WebSocketMessage) => void) => () => void
  reconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const socketToken = useUserDataStore((state) => state.socketToken)
  const messageCallbacks = useRef<Set<(data: WebSocketMessage) => void>>(new Set())
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (!socketToken || hasInitializedRef.current) {
      return
    }

    hasInitializedRef.current = true

    const wsClient = getWebSocketClient({
      onOpen: () => {
        console.log("[v0] WebSocket connected")
        setIsConnected(true)
      },
      onMessage: (data) => {
        messageCallbacks.current.forEach((callback) => callback(data))
      },
      onError: (error) => {
        console.error("[v0] WebSocket error:", error)
        setIsConnected(false)
      },
      onClose: () => {
        console.log("[v0] WebSocket disconnected")
        setIsConnected(false)
      },
    })

    wsClient.connect().catch((error) => {
      console.error("[v0] Failed to connect WebSocket:", error)
    })
  }, [socketToken])

  const joinChannel = (channel: string, id: number) => {
    const wsClient = getWebSocketClient()
    wsClient.joinChannel(channel, id)
  }

  const leaveChannel = (channel: string) => {
    const wsClient = getWebSocketClient()
    wsClient.leaveChannel(channel)
  }

  const getChatHistory = (channel: string, orderId: string) => {
    const wsClient = getWebSocketClient()
    wsClient.getChatHistory(channel, orderId)
  }

  const subscribe = (callback: (data: WebSocketMessage) => void) => {
    messageCallbacks.current.add(callback)
    return () => {
      messageCallbacks.current.delete(callback)
    }
  }

  const reconnect = () => {
    const wsClient = getWebSocketClient()
    wsClient.disconnect()
    hasInitializedRef.current = false
    wsClient
      .connect()
      .then(() => {
        setIsConnected(true)
      })
      .catch((error) => {
        console.error("[v0] Failed to reconnect WebSocket:", error)
      })
  }

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        joinChannel,
        leaveChannel,
        getChatHistory,
        subscribe,
        reconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider")
  }
  return context
}
