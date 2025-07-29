"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageCircle, Shield, MapPin, User } from "lucide-react"

interface UserInfoProps {
  user: {
    id: string
    name: string
    avatar?: string
    rating: number
    totalReviews: number
    completionRate: number
    joinDate: string
    lastSeen: string
    isVerified: {
      id: boolean
      address: boolean
      phone: boolean
      email: boolean
    }
    stats: {
      totalTrades: number
      buyOrders: number
      sellOrders: number
      avgReleaseTime: string
      avgPayTime: string
    }
    location?: string
    languages?: string[]
    paymentMethods?: string[]
  }
}

export function UserInfo({ user }: UserInfoProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleMessage = () => {
    // Handle message functionality
    console.log("Message user:", user.id)
  }

  const handleBlock = () => {
    // Handle block functionality
    console.log("Block user:", user.id)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{user.rating}</span>
                  <span className="ml-1 text-sm text-muted-foreground">({user.totalReviews} reviews)</span>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <Image src="/icons/check-icon.png" alt="Check" width={16} height={16} className="mr-1" />
                <span className="text-sm text-muted-foreground">{user.completionRate}% completion rate</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant={isFollowing ? "outline" : "default"} size="sm" onClick={handleFollow}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleMessage}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {user.isVerified.id && (
            <Badge variant="secondary" className="flex items-center">
              <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
              ID Verified
            </Badge>
          )}
          {user.isVerified.address && (
            <Badge variant="secondary" className="flex items-center">
              <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
              Address Verified
            </Badge>
          )}
          {user.isVerified.phone && (
            <Badge variant="secondary" className="flex items-center">
              <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
              Phone Verified
            </Badge>
          )}
          {user.isVerified.email && (
            <Badge variant="secondary" className="flex items-center">
              <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
              Email Verified
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.totalTrades}</div>
            <div className="text-sm text-muted-foreground">Total trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.buyOrders}</div>
            <div className="text-sm text-muted-foreground">Buy orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.sellOrders}</div>
            <div className="text-sm text-muted-foreground">Sell orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.stats.avgReleaseTime}</div>
            <div className="text-sm text-muted-foreground">Avg. release time</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Joined {user.joinDate}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">Last seen {user.lastSeen}</span>
          </div>
          {user.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">{user.location}</span>
            </div>
          )}
          {user.languages && user.languages.length > 0 && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground mr-2">Languages:</span>
              <span>{user.languages.join(", ")}</span>
            </div>
          )}
          {user.paymentMethods && user.paymentMethods.length > 0 && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground mr-2">Payment methods:</span>
              <span>{user.paymentMethods.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" size="sm" onClick={handleBlock}>
            Block User
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
