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
  const [socketToken, setSocketToken] = useState<string | null>(null)

  useEffect(() => {
    const checkSocketToken = () => {
      const token = localStorage.getItem("socket_token")
      if (token && token.trim() !== "") {
        setSocketToken(token)
      }
    }

    checkSocketToken()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "socket_token" && e.newValue) {
        setSocketToken(e.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also check periodically in case the token is set in the same tab
    const interval = setInterval(checkSocketToken, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!socketToken) {
      return
    }

    const wsOptions: WebSocketOptions = {
      onOpen: (socket) => {
        console.log("[v0] WebSocket connected successfully")
        setIsConnected(true)
      },
      onMessage: (data, socket) => {
        // Notify all subscribers
        subscribersRef.current.forEach((callback) => callback(data))
      },
      onClose: (event, socket) => {
        console.log("[v0] WebSocket disconnected")
        setIsConnected(false)
      },
      onError: (error, socket) => {
        console.error("WebSocket error:", error)
      },
    }

    const wsClient = new WebSocketClient(wsOptions)
    wsClientRef.current = wsClient

    wsClient.connect().catch((error) => {
      console.error("Failed to connect to WebSocket:", error)
    })

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
      }
    }
  }, [socketToken]) // Depend on socketToken instead of empty dependency array

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

  const leaveChannel = (channel: string, id: number) => {
    if (wsClientRef.current) {
      wsClientRef.current.leaveChannel(channel, id)
    }
  }

  const getChatHistory = (channel: string, orderId: string) => {
    if (wsClientRef.current) {
      wsClientRef.current.getChatHistory(channel, orderId)
    }
  }

  const reconnect = () => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect()
      wsClientRef.current.connect().catch((error) => {
        console.error("Failed to reconnect to WebSocket:", error)
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
