"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { WebSocketClient } from "@/lib/websocket"
import { isP2PMaintenanceActive } from "@/lib/p2p-maintenance-env"
import { useP2PSystemMaintenance } from "@/hooks/use-p2p-system-maintenance"
import { isP2PWebSocketEligibleFromState } from "@/lib/p2p-websocket-eligibility"
import { useUserDataStore } from "@/stores/user-data-store"
import type { WebSocketMessage } from "@/lib/websocket-message"
import type { WebSocketOptions } from "@/lib/websocket-options"

export function useWebSocket(options?: WebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const wsClientRef = useRef<WebSocketClient | null>(null)
  const { isActive: isMaintenanceActive } = useP2PSystemMaintenance()
  const userId = useUserDataStore((state) => state.userId)
  const userData = useUserDataStore((state) => state.userData)
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const isWebSocketEligible = isP2PWebSocketEligibleFromState({ userId, userData, onboardingStatus })

  // Initialize the WebSocket client
  useEffect(() => {
    if (isMaintenanceActive || !isWebSocketEligible) {
      wsClientRef.current?.disconnect()
      setIsConnected(false)
      return
    }

    const wsOptions: WebSocketOptions = {
      ...options,
      onOpen: (socket) => {
        setIsConnected(true)
        if (options?.onOpen) options.onOpen(socket)
      },
      onMessage: (data, socket) => {
        setLastMessage(data)
        if (options?.onMessage) options.onMessage(data, socket)
      },
      onClose: (event, socket) => {
        setIsConnected(false)
        if (options?.onClose) options.onClose(event, socket)
      },
      onError: (error, socket) => {
        if (options?.onError) options.onError(error, socket)
      },
    }

    const wsClient = new WebSocketClient(wsOptions)
    wsClientRef.current = wsClient

    wsClient.connect().catch((error) => {
      if (!isP2PMaintenanceActive() && isWebSocketEligible) {
        console.error("Failed to connect to WebSocket:", error)
      }
    })

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
      }
    }
  }, [isMaintenanceActive, isWebSocketEligible])

  // Send a message
  const sendMessage = useCallback((message: WebSocketMessage): boolean => {
    if (isMaintenanceActive || !isWebSocketEligible) {
      console.warn("WebSocket send blocked:", {
        maintenance: isMaintenanceActive,
        eligible: isWebSocketEligible,
      })
      return false
    }
    return wsClientRef.current?.send(message) ?? false
  }, [isMaintenanceActive, isWebSocketEligible])

  // Join a channel
  const joinChannel = useCallback((channel: string, id: number): boolean => {
    if (isMaintenanceActive || !isWebSocketEligible) {
      console.warn("WebSocket join blocked:", {
        maintenance: isMaintenanceActive,
        eligible: isWebSocketEligible,
      })
      return false
    }
    return wsClientRef.current?.joinChannel(channel, id) ?? false
  }, [isMaintenanceActive, isWebSocketEligible])

  // Leave a channel
  const leaveChannel = useCallback((channel: string) => {
    if (wsClientRef.current) {
      wsClientRef.current.leaveChannel(channel)
    }
  }, [])

  // Get chat history
  const getChatHistory = useCallback((channel: string, orderId: string) => {
    if (isMaintenanceActive || !isWebSocketEligible) return
    if (wsClientRef.current) {
      wsClientRef.current.getChatHistory(channel, orderId)
    }
  }, [isMaintenanceActive, isWebSocketEligible])

  // Reconnect manually
  const reconnect = useCallback(() => {
    if (isMaintenanceActive || !isWebSocketEligible) return
    if (wsClientRef.current) {
      wsClientRef.current.disconnect()
      wsClientRef.current.connect().catch((error) => {
        console.error("Failed to reconnect to WebSocket:", error)
      })
    }
  }, [isMaintenanceActive, isWebSocketEligible])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    joinChannel,
    leaveChannel,
    getChatHistory,
    reconnect,
  }
}
