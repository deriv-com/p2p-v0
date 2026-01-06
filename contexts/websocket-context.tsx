"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import type { WebSocketMessage } from "@/lib/websocket-message"
import type { WebSocketOptions } from "@/lib/websocket-options"

const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const MAX_RECONNECT_ATTEMPTS = 10
const INITIAL_RECONNECT_DELAY = 1000 // 1 second
const MAX_RECONNECT_DELAY = 30000 // 30 seconds
const RECONNECT_BACKOFF_MULTIPLIER = 1.5

export class WebSocketClient {
  private socket: WebSocket | null = null
  private options: WebSocketOptions
  private isConnecting = false
  private currentToken: string | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private shouldReconnect = true
  private isManualDisconnect = false

  constructor(options: WebSocketOptions = {}) {
    this.options = options
  }

  private getSocketToken(): string | null {
    if (typeof window === "undefined") return null
    return useUserDataStore.getState().socketToken
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log("[v0] Sending heartbeat ping")
        // Send a ping message to keep the connection alive
        const pingMessage: WebSocketMessage = {
          action: "ping",
          payload: {},
        }
        this.send(pingMessage)
      }
    }, HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.isManualDisconnect) {
      console.log("[v0] Skipping reconnect - manual disconnect or disabled")
      return
    }

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("[v0] Max reconnection attempts reached")
      if (this.options.onMaxReconnectAttemptsReached) {
        this.options.onMaxReconnectAttemptsReached()
      }
      return
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(RECONNECT_BACKOFF_MULTIPLIER, this.reconnectAttempts),
      MAX_RECONNECT_DELAY,
    )

    console.log(`[v0] Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`[v0] Attempting reconnect ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
      this.connect().catch((error) => {
        console.error("[v0] Reconnection failed:", error)
        this.scheduleReconnect()
      })
    }, delay)
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  public connect(): Promise<WebSocket> {
    const socketToken = this.getSocketToken()

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.socket)
    }

    if (this.socket) {
      this.disconnect(false)
    }

    if (this.isConnecting) {
      return Promise.reject(new Error("Connection already in progress"))
    }

    this.isConnecting = true
    this.isManualDisconnect = false

    return new Promise((resolve, reject) => {
      try {
        const url = process.env.NEXT_PUBLIC_SOCKET_URL
        const protocols = socketToken && socketToken.trim() ? [socketToken] : undefined
        this.socket = new WebSocket(url, protocols)
        this.currentToken = socketToken

        this.socket.onopen = () => {
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.cancelReconnect()
          this.startHeartbeat()
          console.log("[v0] WebSocket connected successfully")
          if (this.options.onOpen) {
            this.options.onOpen(this.socket!)
          }
          resolve(this.socket!)
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.action === "pong") {
              console.log("[v0] Received heartbeat pong")
              return
            }
            if (this.options.onMessage) {
              this.options.onMessage(data, this.socket!)
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err)
          }
        }

        this.socket.onerror = (event) => {
          this.isConnecting = false
          console.error("[v0] WebSocket error:", event)
          if (this.options.onError) {
            this.options.onError(event, this.socket!)
          }
          reject(event)
        }

        this.socket.onclose = (event) => {
          this.isConnecting = false
          this.currentToken = null
          this.stopHeartbeat()
          console.log(`[v0] WebSocket closed - Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`)
          
          if (this.options.onClose) {
            this.options.onClose(event, this.socket!)
          }

          if (!this.isManualDisconnect && this.shouldReconnect) {
            this.scheduleReconnect()
          }
        }
      } catch (error) {
        this.isConnecting = false
        console.error("[v0] Error creating WebSocket:", error)
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

  public joinExchangeRatesChannel(buyCurrency: string, forCurrency: string): void {
    const channel = forCurrency ? `exchange_rates/${buyCurrency}/${forCurrency}` : `exchange_rates/${buyCurrency}`
    const joinMessage: WebSocketMessage = {
      action: "join",
      options: {
        channel,
      },
      payload: {},
    }
    this.send(joinMessage)
  }

  public leaveExchangeRatesChannel(buyCurrency: string, forCurrency: string): void {
    const channel = forCurrency ? `exchange_rates/${buyCurrency}/${forCurrency}` : `exchange_rates/${buyCurrency}`
    this.leaveChannel(channel)
  }

  public joinAdvertsChannel(accountCurrency: string, localCurrency: string, advertType: string): void {
    const channel = `adverts/currency/${accountCurrency}/${localCurrency}/${advertType}`
    const joinMessage: WebSocketMessage = {
      action: "join",
      options: {
        channel,
      },
      payload: {},
    }
    this.send(joinMessage)
  }

  public leaveAdvertsChannel(accountCurrency: string, localCurrency: string, advertType: string): void {
    const channel = `adverts/currency/${accountCurrency}/${localCurrency}/${advertType}`
    this.leaveChannel(channel)
  }

  public joinUserChannel(): void {
    const joinMessage: WebSocketMessage = {
      action: "join",
      options: {
        channel: "users/me",
      },
      payload: {},
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

  public disconnect(manual: boolean = true): void {
    this.isManualDisconnect = manual
    this.shouldReconnect = !manual
    
    this.stopHeartbeat()
    this.cancelReconnect()
    
    if (this.socket) {
      if (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
      this.socket = null
      this.isConnecting = false
      this.currentToken = null
    }
    
    if (manual) {
      console.log("[v0] Manual disconnect - reconnection disabled")
      this.reconnectAttempts = 0
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  public hasValidToken(): boolean {
    const token = this.getSocketToken()
    return token !== null && token.trim() !== ""
  }

  public enableReconnection(): void {
    this.shouldReconnect = true
    this.isManualDisconnect = false
  }

  public subscribeToUserUpdates(): void {
    this.joinUserChannel()
    const subscribeMessage: WebSocketMessage = {
      action: "subscribe",
      options: {
        channel: "users/me",
      },
      payload: {},
    }
    this.send(subscribeMessage)
  }

  public unsubscribeFromUserUpdates(): void {
    const unsubscribeMessage: WebSocketMessage = {
      action: "unsubscribe",
      options: {
        channel: "users/me",
      },
      payload: {},
    }
    this.send(unsubscribeMessage)
  }

  public requestExchangeRate(buyCurrency: string, forCurrency: string): void {
    const channel = forCurrency ? `exchange_rates/${buyCurrency}/${forCurrency}` : `exchange_rates/${buyCurrency}`
    const requestMessage: WebSocketMessage = {
      action: "message",
      options: {
        channel,
      },
      payload: {},
    }
    this.send(requestMessage)
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
  subscribeToUserUpdates: () => void
  unsubscribeFromUserUpdates: () => void
  joinExchangeRatesChannel: (buyCurrency: string, forCurrency: string) => void
  leaveExchangeRatesChannel: (buyCurrency: string, forCurrency: string) => void
  requestExchangeRate: (buyCurrency: string, forCurrency: string) => void
  joinAdvertsChannel: (accountCurrency: string, localCurrency: string, advertType: string) => void
  leaveAdvertsChannel: (accountCurrency: string, localCurrency: string, advertType: string) => void
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
  const wsClientRef = useRef<WebSocketClient | null>(null)
  const subscribersRef = useRef<Set<(data: any) => void>>(new Set())
  const hasInitializedRef = useRef(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (hasInitializedRef.current) return

    hasInitializedRef.current = true

    const wsClient = getWebSocketClient({
      onOpen: () => {
        setIsConnected(true)
        const userData = useUserDataStore.getState().userData
        if (userData?.signup === "v1") {
          wsClient.subscribeToUserUpdates()
        }
      },
      onMessage: (data) => {
        subscribersRef.current.forEach((callback) => callback(data))
      },
      onClose: () => {
        setIsConnected(false)
      },
      onError: (error) => {
        console.error("WebSocket error:", error)
        setIsConnected(false)
      },
      onMaxReconnectAttemptsReached: () => {
        console.error("[v0] Failed to reconnect after maximum attempts")
        // Optionally show user notification here
      },
    })

    wsClientRef.current = wsClient

    wsClient.connect().catch((error) => {
      console.error("Failed to connect WebSocket:", error)
    })

    return () => {
      if (wsClientRef.current) {
        const userData = useUserDataStore.getState().userData
        if (userData?.signup === "v1") {
          wsClientRef.current.unsubscribeFromUserUpdates()
        }
        wsClientRef.current.disconnect(true)
      }
    }
  }, [])

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
      wsClientRef.current.enableReconnection()
      wsClientRef.current.disconnect(false)
      wsClientRef.current.connect().catch((error) => {
        console.error("Failed to reconnect WebSocket:", error)
      })
    }
  }

  const subscribeToUserUpdates = () => {
    wsClientRef.current?.subscribeToUserUpdates()
  }

  const unsubscribeFromUserUpdates = () => {
    wsClientRef.current?.unsubscribeFromUserUpdates()
  }

  const joinExchangeRatesChannel = (buyCurrency: string, forCurrency: string) => {
    wsClientRef.current?.joinExchangeRatesChannel(buyCurrency, forCurrency)
  }

  const leaveExchangeRatesChannel = (buyCurrency: string, forCurrency: string) => {
    wsClientRef.current?.leaveExchangeRatesChannel(buyCurrency, forCurrency)
  }

  const requestExchangeRate = (buyCurrency: string, forCurrency: string) => {
    wsClientRef.current?.requestExchangeRate(buyCurrency, forCurrency)
  }

  const joinAdvertsChannel = (accountCurrency: string, localCurrency: string, advertType: string) => {
    wsClientRef.current?.joinAdvertsChannel(accountCurrency, localCurrency, advertType)
  }

  const leaveAdvertsChannel = (accountCurrency: string, localCurrency: string, advertType: string) => {
    wsClientRef.current?.leaveAdvertsChannel(accountCurrency, localCurrency, advertType)
  }

  const value: WebSocketContextType = {
    isConnected,
    joinChannel,
    leaveChannel,
    getChatHistory,
    subscribe,
    reconnect,
    subscribeToUserUpdates,
    unsubscribeFromUserUpdates,
    joinExchangeRatesChannel,
    leaveExchangeRatesChannel,
    requestExchangeRate,
    joinAdvertsChannel,
    leaveAdvertsChannel,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}
