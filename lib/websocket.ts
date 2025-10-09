import { useUserDataStore } from "@/stores/user-data-store"
import type { WebSocketMessage } from "./websocket-message"
import type { WebSocketOptions } from "./websocket-options"

export class WebSocketClient {
  private socket: WebSocket | null = null
  private options: WebSocketOptions
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isConnecting = false

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectInterval: 3000,
      ...options,
    }
  }

  private getSocketToken(): string | null {
    if (typeof window === "undefined") return null
    return useUserDataStore.getState().socketToken
  }

  public connect(): Promise<WebSocket> {
    if (this.isConnecting) {
      console.log("[v0] Connection already in progress, skipping")
      return Promise.reject(new Error("Connection already in progress"))
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("[v0] Already connected, returning existing socket")
      return Promise.resolve(this.socket)
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true
        const url = process.env.NEXT_PUBLIC_SOCKET_URL
        const socketToken = this.getSocketToken()

        if (!socketToken) {
          this.isConnecting = false
          reject(new Error("No socket token available"))
          return
        }

        console.log("[v0] Creating new WebSocket connection")
        const protocols = socketToken.trim() ? [socketToken] : undefined
        this.socket = new WebSocket(url, protocols)

        this.socket.onopen = () => {
          console.log("[v0] WebSocket opened")
          this.reconnectAttempts = 0
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
          console.error("[v0] WebSocket error event")
          this.isConnecting = false
          if (this.options.onError) {
            this.options.onError(event, this.socket!)
          }
          reject(event)
        }

        this.socket.onclose = (event) => {
          console.log("[v0] WebSocket closed")
          this.isConnecting = false
          if (this.options.onClose) {
            this.options.onClose(event, this.socket!)
          }

          if (this.options.autoReconnect && this.reconnectAttempts < (this.options.maxReconnectAttempts || 5)) {
            this.reconnectTimeout = setTimeout(() => {
              this.reconnectAttempts++
              console.log(`[v0] Reconnecting... Attempt ${this.reconnectAttempts}`)
              this.connect()
            }, this.options.reconnectInterval)
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
    console.log("[v0] Disconnecting WebSocket")
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.onclose = null
      this.socket.onerror = null
      this.socket.onmessage = null
      this.socket.onopen = null

      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close()
      }
      this.socket = null
    }

    this.isConnecting = false
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  public hasValidToken(): boolean {
    const token = this.getSocketToken()
    return token !== null && token.trim() !== ""
  }
}

// Each WebSocketProvider will manage its own instance
