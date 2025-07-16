"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getUserAdverts, deleteAdvert } from "./api/api-ads"
import type { MyAd } from "./types"
import { useIsMobile } from "@/hooks/use-mobile"
import StatusModal from "./components/ui/status-modal"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import DeleteConfirmationDialog from "./components/delete-confirmation-dialog"
import MyAdsTable from "./components/my-ads-table"
import MyAdsMobileView from "./components/my-ads-mobile-view"
import MyAdsHeader from "./components/my-ads-header"

export default function AdsPage() {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean; ad: MyAd | null }>({ show: false, ad: null })
  const [statusFeedback, setStatusFeedback] = useState<{
    success: "create" | "update"
    type: string
    id: string
  } | null>(null)
  const [errorModal, setErrorModal] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: "",
    message: "",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  console.log("🎨 AdsPage render:", { loading, statusFeedback, adsCount: ads.length })

  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log("🚀 AdsPage: Starting to fetch ads...")
        setLoading(true)
        setError(null)

        console.log("📡 Fetching adverts for user ID:")
        const userAdverts = await getUserAdverts()
        console.log("📊 User adverts response:", userAdverts)

        setAds(userAdverts)
        console.log(`✅ Successfully fetched ${userAdverts.length} ads`)

        // After ads loaded, check for URL params and set feedback
        console.log("🔍 AdsPage: Checking URL params...")
        const success = searchParams.get("success")
        const type = searchParams.get("type")
        const id = searchParams.get("id")

        console.log("🔍 URL params:", { success, type, id })

        if (success && type && id && (success === "create" || success === "update")) {
          console.log("✅ Valid success params found, setting status feedback")
          setStatusFeedback({ success, type, id })
          console.log("🧹 Cleaning URL...")
          router.replace("/ads", { scroll: false })
        } else {
          console.log("❌ No valid success params found")
        }

        console.log("🏁 Ads fetch completed, setting loading to false")
      } catch (err) {
        console.error("❌ Error fetching ads:", err)
        setError("Failed to load ads. Please try again later.")
        setAds([])
        setErrorModal({
          show: true,
          title: "Error Loading Ads",
          message: err instanceof Error ? err.message : "Failed to load ads. Please try again later.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [searchParams, router])

  const handleCreateAd = () => {
    router.push("/ads/create")
  }

  const handleEditAd = (ad: MyAd) => {
    localStorage.setItem("editAdData", JSON.stringify(ad))
    router.push(`/ads/create?mode=edit&id=${ad.id}`)
  }

  const handleDeleteAd = (ad: MyAd) => {
    setDeleteDialog({ show: true, ad })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.ad) return

    try {
      await deleteAdvert(deleteDialog.ad.id)
      setAds(ads.filter((ad) => ad.id !== deleteDialog.ad!.id))
      setDeleteDialog({ show: false, ad: null })
    } catch (error) {
      console.error("Error deleting ad:", error)
      setErrorModal({
        show: true,
        title: "Error Deleting Ad",
        message: "Failed to delete the ad. Please try again.",
      })
    }
  }

  const handleStatusModalClose = () => {
    console.log("🎭 Closing status modal")
    setStatusFeedback(null)
  }

  const handleErrorModalClose = () => {
    setErrorModal({ show: false, title: "", message: "" })
  }

  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || ad.type.toLowerCase() === activeTab
    return matchesSearch && matchesTab
  })

  // Modal visibility check
  const shouldShowModal = !loading && statusFeedback
  console.log("🎭 Modal visibility check:", { loading, statusFeedback, shouldShowModal })

  if (loading) {
    return (
      <div className="container mx-auto p-4 bg-white min-h-screen">
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your ads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <MyAdsHeader onCreateAd={handleCreateAd} />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search ads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({ads.length})</TabsTrigger>
          <TabsTrigger value="buy">Buy ({ads.filter((ad) => ad.type === "buy").length})</TabsTrigger>
          <TabsTrigger value="sell">Sell ({ads.filter((ad) => ad.type === "sell").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredAds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "No ads match your search." : "You haven't created any ads yet."}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateAd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first ad
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {isMobile ? (
                <MyAdsMobileView ads={filteredAds} onEdit={handleEditAd} onDelete={handleDeleteAd} />
              ) : (
                <MyAdsTable ads={filteredAds} onEdit={handleEditAd} onDelete={handleDeleteAd} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Success Modal - Desktop */}
      {shouldShowModal && !isMobile && (
        <>
          {console.log("🎭 Rendering desktop StatusModal")}
          <StatusModal
            type="success"
            title={statusFeedback.success === "create" ? "Ad created" : "Ad updated"}
            message={
              statusFeedback.success === "create"
                ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
                : "Your ad has been successfully updated."
            }
            adType={statusFeedback.type.toUpperCase()}
            adId={statusFeedback.id}
            onClose={handleStatusModalClose}
          />
        </>
      )}

      {/* Success Modal - Mobile */}
      {shouldShowModal && isMobile && (
        <>
          {console.log("🎭 Rendering mobile StatusBottomSheet")}
          <StatusBottomSheet
            isOpen={true}
            onClose={handleStatusModalClose}
            type="success"
            title={statusFeedback.success === "create" ? "Ad created" : "Ad updated"}
            message={
              statusFeedback.success === "create"
                ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
                : "Your ad has been successfully updated."
            }
            adType={statusFeedback.type.toUpperCase()}
            adId={statusFeedback.id}
          />
        </>
      )}

      {/* Error Modal - Desktop */}
      {errorModal.show && !isMobile && (
        <>
          {console.log("🎭 Rendering error modal")}
          <StatusModal
            type="error"
            title={errorModal.title}
            message={errorModal.message}
            onClose={handleErrorModalClose}
          />
        </>
      )}

      {/* Error Modal - Mobile */}
      {errorModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={true}
          onClose={handleErrorModalClose}
          type="error"
          title={errorModal.title}
          message={errorModal.message}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, ad: null })}
        onConfirm={confirmDelete}
        adType={deleteDialog.ad?.type || ""}
      />
    </div>
  )
}
