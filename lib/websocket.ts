import { API, USER } from "@/lib/local-variables"

export interface WebSocketMessage {
  action: string
  options: {
    channel: string
    [key: string]: any
  }
  payload: any
}

export interface WebSocketOptions {
  onOpen?: (socket: WebSocket) => void
  onMessage?: (data: any, socket: WebSocket) => void
  onError?: (error: Event, socket: WebSocket) => void
  onClose?: (event: CloseEvent, socket: WebSocket) => void
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectInterval?: number
}

export class WebSocketClient {
  private socket: WebSocket | null = null
  private options: WebSocketOptions
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isIOS = false
  private lastPingTime = 0
  private pingInterval: NodeJS.Timeout | null = null

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectInterval: 3000,
      ...options,
    }

    this.isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)
    console.log("[v0] WebSocketClient initialized, iOS detected:", this.isIOS)
  }

  public connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        const url = API.socketUrl
        console.log("[v0] Connecting to WebSocket:", url)
        this.socket = new WebSocket(url, [USER.socketToken])

        this.socket.onopen = () => {
          console.log("[v0] WebSocket connected successfully")
          this.reconnectAttempts = 0

          if (this.isIOS) {
            this.startPingMechanism()
          }

          if (this.options.onOpen) {
            this.options.onOpen(this.socket!)
          }
          resolve(this.socket!)
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("[v0] WebSocket message received:", data.action || "unknown")

            if (data.action === "pong" && this.isIOS) {
              this.lastPingTime = Date.now()
              return
            }

            if (this.options.onMessage) {
              this.options.onMessage(data, this.socket!)
            }
          } catch (err) {
            console.error("[v0] Error parsing WebSocket message:", err)
          }
        }

        this.socket.onerror = (event) => {
          console.error("[v0] WebSocket error:", event)
          if (this.options.onError) {
            this.options.onError(event, this.socket!)
          }
          reject(event)
        }

        this.socket.onclose = (event) => {
          console.log("[v0] WebSocket closed:", event.code, event.reason)

          if (this.pingInterval) {
            clearInterval(this.pingInterval)
            this.pingInterval = null
          }

          if (this.options.onClose) {
            this.options.onClose(event, this.socket!)
          }

          const maxAttempts = this.isIOS ? 10 : this.options.maxReconnectAttempts || 5
          const reconnectDelay = this.isIOS ? 5000 : this.options.reconnectInterval

          if (this.options.autoReconnect && this.reconnectAttempts < maxAttempts) {
            console.log(
              `[v0] Scheduling reconnection attempt ${this.reconnectAttempts + 1}/${maxAttempts} in ${reconnectDelay}ms`,
            )
            this.reconnectTimeout = setTimeout(() => {
              this.reconnectAttempts++
              this.connect().catch((err) => {
                console.error("[v0] Reconnection failed:", err)
              })
            }, reconnectDelay)
          } else {
            console.log("[v0] Max reconnection attempts reached")
          }
        }
      } catch (error) {
        console.error("[v0] Error creating WebSocket:", error)
        reject(error)
      }
    })
  }

  private startPingMechanism(): void {
    if (!this.isIOS || this.pingInterval) return

    console.log("[v0] Starting ping mechanism for iOS")
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const pingMessage = {
          action: "ping",
          options: { channel: "system" },
          payload: { timestamp: Date.now() },
        }
        this.socket.send(JSON.stringify(pingMessage))
        console.log("[v0] Ping sent to maintain iOS connection")
      }
    }, 30000) // Ping every 30 seconds on iOS
  }

  public send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("[v0] Sending WebSocket message:", message.action)
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn("[v0] WebSocket is not connected. Message not sent:", message.action)

      if (this.isIOS && this.options.autoReconnect) {
        console.log("[v0] Attempting auto-reconnect on iOS due to send failure")
        this.connect().catch((err) => {
          console.error("[v0] Auto-reconnect failed:", err)
        })
      }
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

    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }
}

let wsClientInstance: WebSocketClient | null = null

export function getWebSocketClient(options?: WebSocketOptions): WebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient(options)
  } else if (options) {
    wsClientInstance.disconnect()
    wsClientInstance = new WebSocketClient(options)
  }

  return wsClientInstance
}
