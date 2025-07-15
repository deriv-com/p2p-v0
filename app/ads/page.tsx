"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import { getUserAdverts, deleteAd } from "./api/api-ads"
import StatusModal from "./components/ui/status-modal"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import DeleteConfirmationDialog from "./components/ui/delete-confirmation-dialog"
import MyAdsTable from "./components/my-ads-table"
import MyAdsMobileView from "./components/my-ads-mobile-view"

interface Ad {
  id: string
  type: "buy" | "sell"
  currency: string
  amount: string
  rate: {
    display: string
    value: string
  }
  limits: string
  paymentMethods: string[]
  completion: string
  avgTime: string
  status: "active" | "inactive" | "archived"
  available: {
    current: number
    total: number
  }
  description?: string
}

interface StatusModalState {
  show: boolean
  type: "success" | "error" | "warning"
  title: string
  message: string
  subMessage?: string
  adType?: string
  adId?: string
  actionButtonText?: string
}

export default function AdsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useIsMobile()

  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [statusModal, setStatusModal] = useState<StatusModalState>({
    show: false,
    type: "success",
    title: "",
    message: "",
    subMessage: "",
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean
    adId: string | null
    adType: string
  }>({
    show: false,
    adId: null,
    adType: "",
  })

  // Check for success parameters from URL
  useEffect(() => {
    const success = searchParams.get("success")
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    console.log("🔍 Checking URL params:", { success, type, id })

    if (success && type && id) {
      if (success === "created") {
        setStatusModal({
          show: true,
          type: "success",
          title: "Ad created",
          message: "If your ad doesn't receive an order within 3 days, it will be deactivated.",
          adType: type.toUpperCase(),
          adId: id,
        })
      } else if (success === "updated") {
        setStatusModal({
          show: true,
          type: "success",
          title: "Ad updated",
          message: "Your ad has been successfully updated.",
          adType: type.toUpperCase(),
          adId: id,
        })
      }

      // Clean up URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await getUserAdverts()

      if (response && response.length > 0) {
        const formattedAds: Ad[] = response.map((ad: any) => ({
          id: ad.id.toString(),
          type: ad.type,
          currency: "USD/IDR",
          amount: `${ad.available_amount || 0}`,
          rate: {
            display: `IDR ${ad.exchange_rate || 0}`,
            value: `IDR ${ad.exchange_rate || 0}`,
          },
          limits: `IDR ${ad.minimum_order_amount || 0} - ${ad.maximum_order_amount || 0}`,
          paymentMethods: ad.payment_method_names || ad.payment_method_ids || [],
          completion: "100%",
          avgTime: "1 min",
          status: ad.is_active ? "active" : "inactive",
          available: {
            current: ad.available_amount || 0,
            total: ad.available_amount || 0,
          },
          description: ad.description || "",
        }))
        setAds(formattedAds)
      }
    } catch (error) {
      console.error("Error fetching ads:", error)
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
      paymentMethods: ad.paymentMethods,
      available: ad.available,
      description: ad.description,
    }

    localStorage.setItem("editAdData", JSON.stringify(editData))
    router.push(`/ads/create?mode=edit&id=${ad.id}`)
  }

  const handleDeleteAd = (ad: Ad) => {
    setDeleteDialog({
      show: true,
      adId: ad.id,
      adType: ad.type,
    })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.adId) return

    try {
      await deleteAd(deleteDialog.adId)
      setAds(ads.filter((ad) => ad.id !== deleteDialog.adId))
      setDeleteDialog({ show: false, adId: null, adType: "" })

      setStatusModal({
        show: true,
        type: "success",
        title: "Ad deleted",
        message: "Your ad has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting ad:", error)
      setStatusModal({
        show: true,
        type: "error",
        title: "Failed to delete ad",
        message: "Please try again.",
      })
    }
  }

  const filteredAds = ads.filter((ad) => {
    const matchesTab = activeTab === "all" || ad.status === activeTab
    const matchesSearch =
      ad.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  const sortedAds = [...filteredAds].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return Number.parseInt(b.id) - Number.parseInt(a.id)
      case "oldest":
        return Number.parseInt(a.id) - Number.parseInt(b.id)
      case "amount":
        return Number.parseFloat(b.amount) - Number.parseFloat(a.amount)
      default:
        return 0
    }
  })

  const handleModalClose = () => {
    setStatusModal((prev) => ({ ...prev, show: false }))
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading ads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Ads</h1>
          <p className="text-gray-600">Manage your buy and sell advertisements</p>
        </div>
        <Button onClick={handleCreateAd} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create New Ad
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search ads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({ads.filter((ad) => ad.status === "active").length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({ads.filter((ad) => ad.status === "inactive").length})</TabsTrigger>
          <TabsTrigger value="all">All ({ads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {sortedAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No ads found</h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === "active" ? "You don't have any active ads yet." : `No ${activeTab} ads found.`}
                  </p>
                  <Button onClick={handleCreateAd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ad
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {isMobile ? (
                <MyAdsMobileView ads={sortedAds} onEdit={handleEditAd} onDelete={handleDeleteAd} />
              ) : (
                <MyAdsTable ads={sortedAds} onEdit={handleEditAd} onDelete={handleDeleteAd} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {statusModal.show && !isMobile && (
        <StatusModal
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          subMessage={statusModal.subMessage}
          adType={statusModal.adType}
          adId={statusModal.adId}
          onClose={handleModalClose}
          actionButtonText={statusModal.actionButtonText}
        />
      )}

      {statusModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={statusModal.show}
          onClose={handleModalClose}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          subMessage={statusModal.subMessage}
          adType={statusModal.adType}
          adId={statusModal.adId}
          actionButtonText={statusModal.actionButtonText}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, adId: null, adType: "" })}
        onConfirm={confirmDelete}
        adType={deleteDialog.adType}
      />
    </div>
  )
}
