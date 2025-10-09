"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { getWebSocketInstance, type WebSocketMessage, type WebSocketOptions } from "@/lib/websocket"
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
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!socketToken || hasInitializedRef.current) {
      return
    }

    console.log("[v0] Initializing WebSocket connection with token")
    hasInitializedRef.current = true

    const wsOptions: WebSocketOptions = {
      onOpen: (socket) => {
        console.log("[v0] WebSocket connected successfully")
        if (mountedRef.current) {
          setIsConnected(true)
        }
      },
      onMessage: (data, socket) => {
        if (mountedRef.current) {
          subscribersRef.current.forEach((callback) => callback(data))
        }
      },
      onClose: (event, socket) => {
        console.log("[v0] WebSocket disconnected")
        if (mountedRef.current) {
          setIsConnected(false)
        }
      },
      onError: (error, socket) => {
        console.error("[v0] WebSocket error:", error)
      },
    }

    const wsClient = getWebSocketInstance(wsOptions)

    if (!wsClient.isConnected() || wsClient.getCurrentToken() !== socketToken) {
      wsClient.connect().catch((error) => {
        console.error("[v0] Failed to connect to WebSocket:", error)
        if (mountedRef.current) {
          hasInitializedRef.current = false
        }
      })
    } else {
      console.log("[v0] WebSocket already connected, reusing connection")
      setIsConnected(true)
    }

    return () => {
      console.log("[v0] Component unmounting, keeping WebSocket alive")
    }
  }, [socketToken])

  const sendMessage = (message: WebSocketMessage) => {
    const wsClient = getWebSocketInstance()
    if (wsClient.isConnected()) {
      wsClient.send(message)
    }
  }

  const joinChannel = (channel: string, id: number) => {
    const wsClient = getWebSocketInstance()
    if (wsClient.isConnected()) {
      wsClient.joinChannel(channel, id)
    }
  }

  const leaveChannel = (channel: string) => {
    const wsClient = getWebSocketInstance()
    if (wsClient.isConnected()) {
      wsClient.leaveChannel(channel)
    }
  }

  const getChatHistory = (channel: string, orderId: string) => {
    const wsClient = getWebSocketInstance()
    if (wsClient.isConnected()) {
      wsClient.getChatHistory(channel, orderId)
    }
  }

  const reconnect = () => {
    const wsClient = getWebSocketInstance()
    wsClient.disconnect()
    hasInitializedRef.current = false
    wsClient.connect().catch((error) => {
      console.error("Failed to reconnect to WebSocket:", error)
    })
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
