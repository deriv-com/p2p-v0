"use client"

import { useEffect } from "react"
import { joinChannel, leaveChannel, sendMessage } from "./socketUtils"

const OrderChat = ({ orderId }) => {
  useEffect(() => {
    // Join the order channel when component mounts
    joinChannel(`order_${orderId}`)
    // Send order ID in socket message after joining
    sendMessage({
      type: "join_order",
      order_id: orderId,
      channel: `order_${orderId}`,
    })

    return () => {
      // Leave the order channel when component unmounts
      if (orderId) {
        leaveChannel(`order_${orderId}`)
      }
    }
  }, [orderId, joinChannel, leaveChannel, sendMessage])

  // Render the chat component
  return <div>{/* Chat UI components here */}</div>
}

export default OrderChat
