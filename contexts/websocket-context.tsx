"use client"

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import type { WebSocketMessage } from "./websocket-message"
import type { WebSocketOptions } from "./websocket-options"

export class WebSocketClient {
  private socket: WebSocket | null = null
  private options: WebSocketOptions
  private isConnecting = false
  private currentToken: string | null = null

  constructor(options: WebSocketOptions = {}) {
    this.options = options
  }

  private getSocketToken(): string | null {
    if (typeof window === "undefined") return null
    return useUserDataStore.getState().socketToken
  }

  public connect(): Promise<WebSocket> {
    const socketToken = this.getSocketToken()

    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentToken === socketToken) {
      return Promise.resolve(this.socket)
    }

    if (this.socket && this.currentToken !== socketToken) {
      this.disconnect()
    }

    if (this.isConnecting) {
      return Promise.reject(new Error("Connection already in progress"))
    }

    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        const url = process.env.NEXT_PUBLIC_SOCKET_URL
        const protocols = socketToken && socketToken.trim() ? [socketToken] : undefined
        this.socket = new WebSocket(url, protocols)
        this.currentToken = socketToken

        this.socket.onopen = () => {
          this.isConnecting = false
          if (this.options.onOpen) {
            this.options.onOpen(this.socket!)
          }
          resolve(this.socket!)
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (this.options.onMessage) {
              this.options.onMessage(data, this.socket!)
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err)
          }
        }

        this.socket.onerror = (event) => {
          this.isConnecting = false
          if (this.options.onError) {
            this.options.onError(event, this.socket!)
          }
          reject(event)
        }

        this.socket.onclose = (event) => {
          this.isConnecting = false
          this.currentToken = null
          if (this.options.onClose) {
            this.options.onClose(event, this.socket!)
          }
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  public send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message)
    }
  }

  public joinChannel(channel: string, id: number): void {
    const joinMessage: WebSocketMessage = {
      action: "join",
      options: {
        channel,
      },
      payload: {
        order_id: id,
      },
    }
    this.send(joinMessage)
  }

  public leaveChannel(channel: string): void {
    const leaveMessage: WebSocketMessage = {
      action: "leave",
      options: {
        channel,
      },
      payload: {},
    }
    this.send(leaveMessage)
  }

  public getChatHistory(channel: string, orderId: string): void {
    const getChatHistoryMessage: WebSocketMessage = {
      action: "message",
      options: {
        channel,
      },
      payload: {
        chat_history: true,
        order_id: orderId,
      },
    }
    this.send(getChatHistoryMessage)
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.isConnecting = false
      this.currentToken = null
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  public hasValidToken(): boolean {
    const token = this.getSocketToken()
    return token !== null && token.trim() !== ""
  }
}

let wsClientInstance: WebSocketClient | null = null

export function getWebSocketClient(options?: WebSocketOptions): WebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient(options)
  }
  return wsClientInstance
}

interface WebSocketContextType {
  isConnected: boolean
  joinChannel: (channel: string, id: number) => void
  leaveChannel: (channel: string) => void
  getChatHistory: (channel: string, orderId: string) => void
  subscribe: (callback: (data: any) => void) => () => void
  reconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider")
  }
  return context
}

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const socketToken = useUserDataStore((state) => state.socketToken)
  const wsClientRef = useRef<WebSocketClient | null>(null)
  const subscribersRef = useRef<Set<(data: any) => void>>(new Set())
  const hasInitializedRef = useRef(false)
  const isConnectedRef = useRef(false)

  useEffect(() => {
    // Only initialize once when token becomes available
    if (!socketToken || hasInitializedRef.current) return

    hasInitializedRef.current = true

    const wsClient = getWebSocketClient({
      onOpen: () => {
        console.log("[v0] WebSocket connected")
        isConnectedRef.current = true
      },
      onMessage: (data) => {
        subscribersRef.current.forEach((callback) => callback(data))
      },
      onClose: () => {
        console.log("[v0] WebSocket disconnected")
        isConnectedRef.current = false
      },
      onError: (error) => {
        console.error("[v0] WebSocket error:", error)
        isConnectedRef.current = false
      },
    })

    wsClientRef.current = wsClient

    wsClient.connect().catch((error) => {
      console.error("[v0] Failed to connect WebSocket:", error)
    })
  }, [socketToken])

  const joinChannel = (channel: string, id: number) => {
    wsClientRef.current?.joinChannel(channel, id)
  }

  const leaveChannel = (channel: string) => {
    wsClientRef.current?.leaveChannel(channel)
  }

  const getChatHistory = (channel: string, orderId: string) => {
    wsClientRef.current?.getChatHistory(channel, orderId)
  }

  const subscribe = (callback: (data: any) => void) => {
    subscribersRef.current.add(callback)
    return () => {
      subscribersRef.current.delete(callback)
    }
  }

  const reconnect = () => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect()
      wsClientRef.current.connect().catch((error) => {
        console.error("Failed to reconnect WebSocket:", error)
      })
    }
  }

  const value: WebSocketContextType = {
    isConnected: isConnectedRef.current,
    joinChannel,
    leaveChannel,
    getChatHistory,
    subscribe,
    reconnect,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}
