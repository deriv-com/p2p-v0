"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import MyAdsTable from "./components/my-ads-table"
import MyAdsHeader from "./components/my-ads-header"
import MyAdsMobileView from "./components/my-ads-mobile-view"
import StatusModal from "./components/ui/status-modal"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import { getMyAds } from "./api/api-ads"
import type { Ad } from "./types"

interface StatusData {
  show: boolean
  type: string
  id: string
  success: "create" | "update"
}

export default function AdsPage() {
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [statusData, setStatusData] = useState<StatusData | null>(null)

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await getMyAds()
      if (response.data) {
        setAds(response.data)
      }
    } catch (error) {
      console.error("Error fetching ads:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds().then(() => {
      // Check for success parameters after ads are fetched
      const success = searchParams.get("success")
      const type = searchParams.get("type")
      const id = searchParams.get("id")

      if (success && type && id && (success === "create" || success === "update")) {
        setStatusData({
          show: true,
          type,
          id,
          success,
        })
      }
    })
  }, [searchParams])

  const handleStatusModalClose = () => {
    setStatusData(null)
  }

  const getStatusModalProps = () => {
    if (!statusData) return null

    const isCreate = statusData.success === "create"

    return {
      type: "success" as const,
      title: isCreate ? "Ad created" : "Ad updated",
      message: isCreate
        ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
        : "Your ad has been successfully updated.",
      adType: statusData.type.toUpperCase(),
      adId: statusData.id,
    }
  }

  const statusModalProps = getStatusModalProps()

  const activeAds = ads.filter((ad) => ad.status === "active")
  const inactiveAds = ads.filter((ad) => ad.status === "inactive")

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
      <MyAdsHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            Active ads
            {activeAds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeAds.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            Inactive ads
            {inactiveAds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {inactiveAds.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">No active ads</h3>
                  <p className="text-gray-600">Create your first ad to start trading</p>
                  <Button asChild>
                    <a href="/ads/create">Create ad</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {isMobile ? (
                <MyAdsMobileView ads={activeAds} onRefresh={fetchAds} />
              ) : (
                <MyAdsTable ads={activeAds} onRefresh={fetchAds} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">No inactive ads</h3>
                  <p className="text-gray-600">Your inactive ads will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {isMobile ? (
                <MyAdsMobileView ads={inactiveAds} onRefresh={fetchAds} />
              ) : (
                <MyAdsTable ads={inactiveAds} onRefresh={fetchAds} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {statusData && statusModalProps && !isMobile && (
        <StatusModal
          type={statusModalProps.type}
          title={statusModalProps.title}
          message={statusModalProps.message}
          adType={statusModalProps.adType}
          adId={statusModalProps.adId}
          onClose={handleStatusModalClose}
        />
      )}

      {statusData && statusModalProps && isMobile && (
        <StatusBottomSheet
          isOpen={statusData.show}
          onClose={handleStatusModalClose}
          type={statusModalProps.type}
          title={statusModalProps.title}
          message={statusModalProps.message}
          adType={statusModalProps.adType}
          adId={statusModalProps.adId}
        />
      )}
    </div>
  )
}
