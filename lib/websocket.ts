import { useUserDataStore } from "@/stores/user-data-store"
import type { WebSocketMessage } from "./websocket-message"
import type { WebSocketOptions } from "./websocket-options"

export class WebSocketClient {
  private socket: WebSocket | null = null
  private options: WebSocketOptions
  private isConnecting = false

  constructor(options: WebSocketOptions = {}) {
    this.options = options
  }

  private getSocketToken(): string | null {
    if (typeof window === "undefined") return null
    return useUserDataStore.getState().socketToken
  }

  public connect(): Promise<WebSocket> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.socket)
    }

    if (this.socket) {
      this.disconnect()
    }

    if (this.isConnecting) {
      return Promise.reject(new Error("Connection already in progress"))
    }

    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        const url = `${process.env.NEXT_PUBLIC_SOCKET_URL}/p2p/v1/events`
        this.socket = new WebSocket(url)

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

  public disconnect(): void {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
      this.socket = null
      this.isConnecting = false
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
