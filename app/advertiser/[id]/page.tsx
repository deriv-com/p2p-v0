"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BlockConfirmation } from "@/components/block-confirmation"
import { useToast } from "@/hooks/use-toast"
import { Star, MessageCircle, Shield, Clock, TrendingUp, Users } from "lucide-react"

interface AdvertiserPageProps {
  params: {
    id: string
  }
}

export default function AdvertiserPage({ params }: AdvertiserPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isBlocked, setIsBlocked] = useState(false)
  const [isBlockConfirmationOpen, setIsBlockConfirmationOpen] = useState(false)

  // Mock advertiser data - in real app this would come from API
  const advertiser = {
    id: params.id,
    name: "John Doe",
    nickname: "trader123",
    avatar: "/placeholder-user.jpg",
    rating: 4.8,
    totalReviews: 156,
    completionRate: 98.5,
    avgPayTime: "15 mins",
    totalTrades: 1234,
    joinedDate: "Jan 2023",
    isOnline: true,
    lastSeen: "2 mins ago",
    preferredCurrencies: ["USD", "EUR", "GBP"],
    paymentMethods: ["Bank Transfer", "PayPal", "Skrill"],
    bio: "Experienced trader with fast payment processing. Available 24/7 for quick transactions.",
    stats: {
      totalVolume: "$125,000",
      avgReleaseTime: "12 mins",
      positiveRating: 99.2,
    },
  }

  const handleBlockConfirm = () => {
    setIsBlocked(true)
    setIsBlockConfirmationOpen(false)

    // Redirect to Market page first
    router.push("/")

    // Show toast after redirect with a small delay
    setTimeout(() => {
      toast({
        title: "User Blocked",
        description: `${advertiser.nickname} has been blocked successfully.`,
        duration: 5000,
      })
    }, 100)
  }

  const handleMessage = () => {
    // Navigate to chat or open message modal
    console.log("Opening message dialog")
  }

  const handleFollow = () => {
    // Toggle follow status
    console.log("Toggle follow status")
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={advertiser.avatar || "/placeholder.svg"} alt={advertiser.name} />
                <AvatarFallback>{advertiser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{advertiser.name}</h1>
                  {advertiser.isOnline && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Online
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">@{advertiser.nickname}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{advertiser.rating}</span>
                    <span className="text-gray-500">({advertiser.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Last seen {advertiser.lastSeen}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleMessage}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" onClick={handleFollow}>
                <Users className="h-4 w-4 mr-2" />
                Follow
              </Button>
              <Button variant="destructive" onClick={() => setIsBlockConfirmationOpen(true)} disabled={isBlocked}>
                <Shield className="h-4 w-4 mr-2" />
                {isBlocked ? "Blocked" : "Block"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{advertiser.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Pay Time</p>
                <p className="text-2xl font-bold">{advertiser.avgPayTime}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trades</p>
                <p className="text-2xl font-bold">{advertiser.totalTrades.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-gray-600">{advertiser.bio}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Joined</h4>
              <p className="text-gray-600">{advertiser.joinedDate}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Preferred Currencies</h4>
              <div className="flex flex-wrap gap-2">
                {advertiser.preferredCurrencies.map((currency) => (
                  <Badge key={currency} variant="outline">
                    {currency}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Payment Methods</h4>
              <div className="flex flex-wrap gap-2">
                {advertiser.paymentMethods.map((method) => (
                  <Badge key={method} variant="secondary">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Volume</span>
              <span className="font-medium">{advertiser.stats.totalVolume}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Release Time</span>
              <span className="font-medium">{advertiser.stats.avgReleaseTime}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Positive Rating</span>
              <span className="font-medium text-green-600">{advertiser.stats.positiveRating}%</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-medium">{advertiser.totalTrades.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Block Confirmation Dialog */}
      <BlockConfirmation
        isOpen={isBlockConfirmationOpen}
        onClose={() => setIsBlockConfirmationOpen(false)}
        onConfirm={handleBlockConfirm}
        advertiserName={advertiser.nickname}
      />
    </div>
  )
}
