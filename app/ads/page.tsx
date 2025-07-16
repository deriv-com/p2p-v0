"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUserAdverts, deleteAd, toggleAdStatus } from "./api/api-ads"
import { useIsMobile } from "@/hooks/use-mobile"
import StatusModal from "./components/ui/status-modal"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import type { StatusModalState } from "./types"

interface Ad {
  id: string
  type: "buy" | "sell"
  currency_pair: string
  rate: {
    display: string
    value: string
  }
  limits:
    | {
        min: number
        max: number
      }
    | string
  available: {
    current: number
    total: number
  }
  payment_methods: string[]
  status: "active" | "inactive" | "archived"
  created_at: string
  completion_rate?: string
  orders_count?: number
}

const USER = {
  id: "18",
  name: "John Doe",
  avatar: "/placeholder-user.jpg",
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [successModal, setSuccessModal] = useState<StatusModalState>({
    show: false,
    type: "success",
    title: "",
    message: "",
  })
  const [updateModal, setUpdateModal] = useState<StatusModalState>({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  useEffect(() => {
    const success = searchParams.get("success")
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    console.log("🔍 Checking URL params:", { success, type, id })
    console.log("🔍 Full URL:", window.location.href)
    console.log("🔍 Search params string:", searchParams.toString())

    if (success && type && id) {
      if (success === "created") {
        setSuccessModal({
          show: true,
          type: "success",
          title: "Ad created",
          message: "If your ad doesn't receive an order within 3 days, it will be deactivated.",
          adType: type.toUpperCase(),
          adId: id,
        })
      } else if (success === "updated") {
        setUpdateModal({
          show: true,
          type: "success",
          title: "Ad updated",
          message: "Your ad has been successfully updated.",
          adType: type.toUpperCase(),
          adId: id,
        })
      }

      window.history.replaceState({}, "", "/ads")
    } else {
      console.log("❌ No URL parameters found or incomplete")
    }
  }, [searchParams])

  useEffect(() => {
    fetchAds().then(() => {
      console.log("✅ Ads fetched successfully")
    })
  }, [])

  const fetchAds = async () => {
    try {
      setLoading(true)
      console.log("Fetching adverts for user ID:", USER.id)
      const response = await getUserAdverts(USER.id)
      console.log("User adverts response:", response)
      setAds(response || [])
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAd = () => {
    router.push("/ads/create")
  }

  const handleEditAd = (ad: Ad) => {
    const editData = {
      id: ad.id,
      type: ad.type,
      rate: ad.rate,
      limits: ad.limits,
      available: ad.available,
      paymentMethods: ad.payment_methods,
      description: "",
    }

    localStorage.setItem("editAdData", JSON.stringify(editData))
    router.push(`/ads/create?mode=edit&id=${ad.id}`)
  }

  const handleDeleteAd = async (adId: string) => {
    try {
      await deleteAd(adId)
      await fetchAds()
    } catch (error) {
      console.error("Error deleting ad:", error)
    }
  }

  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      await toggleAdStatus(adId, newStatus)
      await fetchAds()
    } catch (error) {
      console.error("Error toggling ad status:", error)
    }
  }

  const handleCloseSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, show: false }))
  }

  const handleCloseUpdateModal = () => {
    setUpdateModal((prev) => ({ ...prev, show: false }))
  }

  const filteredAds = ads.filter((ad) => {
    const matchesTab = activeTab === "all" || ad.status === activeTab
    const matchesSearch =
      ad.currency_pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const sortedAds = [...filteredAds].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "rate_high":
        return Number.parseFloat(b.rate.value) - Number.parseFloat(a.rate.value)
      case "rate_low":
        return Number.parseFloat(a.rate.value) - Number.parseFloat(b.rate.value)
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "archived":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatLimits = (limits: Ad["limits"]) => {
    if (typeof limits === "string") {
      return limits
    }
    return `USD ${limits.min} - ${limits.max}`
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your ads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My ads</h1>
          <p className="text-gray-600">Manage your buy and sell advertisements</p>
        </div>
        <Button onClick={handleCreateAd} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Create new ad
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search ads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="rate_high">Rate: High to Low</SelectItem>
              <SelectItem value="rate_low">Rate: Low to High</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({ads.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({ads.filter((ad) => ad.status === "active").length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({ads.filter((ad) => ad.status === "inactive").length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({ads.filter((ad) => ad.status === "archived").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {sortedAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === "all" ? "You haven't created any ads yet." : `You don't have any ${activeTab} ads.`}
                  </p>
                  {activeTab === "all" && (
                    <Button onClick={handleCreateAd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first ad
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedAds.map((ad) => (
                <Card key={ad.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={ad.type === "buy" ? "default" : "secondary"}>{ad.type.toUpperCase()}</Badge>
                        <div>
                          <CardTitle className="text-lg">{ad.currency_pair}</CardTitle>
                          <p className="text-sm text-gray-600">
                            Created {new Date(ad.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAd(ad)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(ad.id, ad.status)}>
                              {ad.status === "active" ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteAd(ad.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Rate</p>
                        <p className="text-lg font-semibold">{ad.rate.display}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Limits</p>
                        <p className="text-lg font-semibold">{formatLimits(ad.limits)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Available</p>
                        <p className="text-lg font-semibold">
                          USD {ad.available.current} / {ad.available.total}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Payment methods</p>
                      <div className="flex flex-wrap gap-2">
                        {ad.payment_methods.map((method, index) => (
                          <Badge key={index} variant="outline">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {(ad.completion_rate || ad.orders_count) && (
                      <div className="mt-4 flex gap-4 text-sm text-gray-600">
                        {ad.completion_rate && <span>Completion rate: {ad.completion_rate}</span>}
                        {ad.orders_count && <span>Orders: {ad.orders_count}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {successModal.show && !isMobile && (
        <StatusModal
          type={successModal.type}
          title={successModal.title}
          message={successModal.message}
          subMessage={successModal.subMessage}
          adType={successModal.adType}
          adId={successModal.adId}
          onClose={handleCloseSuccessModal}
          actionButtonText={successModal.actionButtonText}
        />
      )}

      {successModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={successModal.show}
          onClose={handleCloseSuccessModal}
          type={successModal.type}
          title={successModal.title}
          message={successModal.message}
          subMessage={successModal.subMessage}
          adType={successModal.adType}
          adId={successModal.adId}
          actionButtonText={successModal.actionButtonText}
        />
      )}

      {updateModal.show && !isMobile && (
        <StatusModal
          type={updateModal.type}
          title={updateModal.title}
          message={updateModal.message}
          subMessage={updateModal.subMessage}
          adType={updateModal.adType}
          adId={updateModal.adId}
          onClose={handleCloseUpdateModal}
          actionButtonText={updateModal.actionButtonText}
        />
      )}

      {updateModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={updateModal.show}
          onClose={handleCloseUpdateModal}
          type={updateModal.type}
          title={updateModal.title}
          message={updateModal.message}
          subMessage={updateModal.subMessage}
          adType={updateModal.adType}
          adId={updateModal.adId}
          actionButtonText={updateModal.actionButtonText}
        />
      )}
    </div>
  )
}
