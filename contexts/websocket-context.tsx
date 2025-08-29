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
  const [shouldConnect, setShouldConnect] = useState(false)

  useEffect(() => {
    const checkSocketToken = () => {
      const socketToken = localStorage.getItem("socket_token")
      if (socketToken && socketToken.trim() !== "") {
        setShouldConnect(true)
        return true
      }
      return false
    }

    // Check immediately
    if (checkSocketToken()) {
      return
    }

    // If token not available, poll for it
    const pollInterval = setInterval(() => {
      if (checkSocketToken()) {
        clearInterval(pollInterval)
      }
    }, 100) // Check every 100ms

    // Clean up interval after 10 seconds to avoid infinite polling
    const timeout = setTimeout(() => {
      clearInterval(pollInterval)
      console.warn("Socket token not available after 10 seconds, WebSocket connection will not be established")
    }, 10000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (!shouldConnect) {
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

    console.log("[v0] Attempting WebSocket connection with token available")
    wsClient.connect().catch((error) => {
      console.error("Failed to connect to WebSocket:", error)
    })

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
      }
    }
  }, [shouldConnect])

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
