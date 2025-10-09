"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { WebSocketClient, type WebSocketMessage, type WebSocketOptions } from "@/lib/websocket"
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
  const wsClientRef = useRef<WebSocketClient | null>(null)
  const subscribersRef = useRef<Set<(data: any) => void>>(new Set())
  const socketToken = useUserDataStore((state) => state.socketToken)
  const isConnectingRef = useRef(false)
  const lastTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (isConnectingRef.current || !socketToken || socketToken === lastTokenRef.current) {
      return
    }

    if (wsClientRef.current?.isConnected() && socketToken === lastTokenRef.current) {
      return
    }

    console.log("[v0] Initializing WebSocket connection with token")
    isConnectingRef.current = true
    lastTokenRef.current = socketToken

    const wsOptions: WebSocketOptions = {
      onOpen: (socket) => {
        console.log("[v0] WebSocket connected successfully")
        setIsConnected(true)
        isConnectingRef.current = false
      },
      onMessage: (data, socket) => {
        subscribersRef.current.forEach((callback) => callback(data))
      },
      onClose: (event, socket) => {
        console.log("[v0] WebSocket disconnected")
        setIsConnected(false)
        isConnectingRef.current = false
      },
      onError: (error, socket) => {
        console.error("[v0] WebSocket error:", error)
        isConnectingRef.current = false
      },
    }

    if (wsClientRef.current) {
      console.log("[v0] Disconnecting existing WebSocket")
      wsClientRef.current.disconnect()
    }

    const wsClient = new WebSocketClient(wsOptions)
    wsClientRef.current = wsClient

    wsClient.connect().catch((error) => {
      console.error("[v0] Failed to connect to WebSocket:", error)
      isConnectingRef.current = false
    })

    return () => {
      console.log("[v0] Cleaning up WebSocket connection")
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
        wsClientRef.current = null
      }
      isConnectingRef.current = false
    }
  }, [socketToken])

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
