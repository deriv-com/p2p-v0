"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdsAPI } from "@/services/api"
import type { Ad } from "../types"
import { cn } from "@/lib/utils"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { formatPaymentMethodName, getPaymentMethodColourByName } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { AdActionsMenu } from "./ad-actions-menu"

interface MyAdsTableProps {
  ads: Ad[]
  hiddenAdverts: boolean
  isLoading: boolean
  onAdDeleted?: (status?: string) => void
}

export default function MyAdsTable({ ads, hiddenAdverts, isLoading, onAdDeleted }: MyAdsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { showAlert } = useAlertDialog()
  const isMobile = useIsMobile()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    show: false,
    adId: "",
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)

  const formatLimits = (ad: Ad) => {
    if (ad.minimum_order_amount && ad.actual_maximum_order_amount) {
      return `${ad.minimum_order_amount} - ${ad.actual_maximum_order_amount} USD `
    }

    if (typeof ad.limits === "string") {
      return ad.limits
    }
    if (ad.limits && typeof ad.limits === "object") {
      return `${ad.limits.currency} ${ad.limits.min} - ${ad.limits.max}`
    }
    return "N/A"
  }

  const getAvailableAmount = (ad: Ad) => {
    if (
      ad.available_amount !== undefined &&
      ad.open_order_amount !== undefined &&
      ad.completed_order_amount !== undefined
    ) {
      const available = Number.parseFloat(ad.available_amount) || 0
      const openOrder = Number.parseFloat(ad.open_order_amount) || 0
      const completed = Number.parseFloat(ad.completed_order_amount) || 0
      const total = available + openOrder + completed

      return {
        current: available,
        total: total,
        percentage: total > 0 ? (available / total) * 100 : 0,
      }
    }

    if (ad.available) {
      const current = Number.parseFloat(ad.available.current) || 0
      const total = Number.parseFloat(ad.available.total) || 0
      return {
        current: current,
        total: total,
        percentage: total > 0 ? (current / total) * 100 : 0,
      }
    }

    return { current: 0, total: 0, percentage: 0 }
  }

  const formatPaymentMethods = (methods: string[]) => {
    if (!methods || methods.length === 0) return "None"
    return (
      <div className="flex flex-row lg:flex-col flex-wrap gap-2 h-full">
        {methods.map((method, index) => (
          <div key={index} className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${getPaymentMethodColourByName(method)}`}></span>
            <span className="text-xs font-normal leading-5 text-gray-900">{formatPaymentMethodName(method)}</span>
          </div>
        ))}
      </div>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="success-light">Active</Badge>
    }
    return <Badge variant="error-light">Inactive</Badge>
  }

  const handleEdit = (ad: Ad) => {
    setDrawerOpen(false)
    router.push(`/ads/edit/${ad.id}`)
  }

  const handleToggleStatus = async (ad: Ad) => {
    setDrawerOpen(false)
    try {
      const isActive = ad.is_active !== undefined ? ad.is_active : ad.status === "Active"
      const isListed = !isActive

      const result = await AdsAPI.toggleAdActiveStatus(ad.id, isListed)

      if (result.success) {
        if (onAdDeleted) {
          onAdDeleted()
        }
      } else {
        showAlert({
          title: "Unable to update advert",
          description: "There was an error when updating the advert. Please try again.",
          confirmText: "OK",
          type: "warning",
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleDelete = (adId: string) => {
    setDrawerOpen(false)
    setDeleteConfirmModal({
      show: true,
      adId: adId,
    })
  }

  const handleOpenDrawer = (ad: Ad) => {
    setSelectedAd(ad)
    setDrawerOpen(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await AdsAPI.deleteAd(deleteConfirmModal.adId)

      if (result.success) {
        if (onAdDeleted) {
          onAdDeleted()
          toast({
            description: (
              <div className="flex items-center gap-2">
                <Image src="/icons/success-checkmark.png" alt="Success" width={24} height={24} className="text-white" />
                <span>Ad deleted</span>
              </div>
            ),
            className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
            duration: 2500,
          })
        }
      } else {
        let description = "There was an error when deleting the advert. Please try again."

        if (result.errors.length > 0 && result.errors[0].code === "AdvertDeleteOpenOrders") {
          description = "The advert has ongoing orders."
        }
        showAlert({
          title: "Unable to delete advert",
          description,
          confirmText: "OK",
          type: "warning",
        })
      }

      setDeleteConfirmModal({ show: false, adId: "" })
    } catch (error) {
      console.log(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmModal({ show: false, adId: "" })
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="mt-2 text-slate-600">Loading ads...</p>
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <EmptyState
        title="You have no ads"
        description="Looking to buy or sell USD? You can post your own ad for others to respond."
        redirectToAds={true}
      />
    )
  }

  return (
    <>
      <div className="w-full">
        <Table>
          <TableHeader className="hidden lg:table-header-group border-b sticky top-0 bg-white">
            <TableRow className="text-xs">
              <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">Ad type</TableHead>
              <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">Available amount</TableHead>
              <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">Payment methods</TableHead>
              <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">Status</TableHead>
              <TableHead className="text-left py-4 px-4 text-slate-600 font-normal"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white lg:divide-y lg:divide-slate-200 font-normal text-sm">
            {ads.map((ad, index) => {
              const availableData = getAvailableAmount(ad)
              const isActive = ad.is_active !== undefined ? ad.is_active : ad.status === "Active"
              const adType = ad.type || "Buy"
              const rate = ad.exchange_rate || ad.rate?.value || "N/A"
              const paymentMethods = ad.payment_methods || ad.paymentMethods || []

              return (
                <TableRow
                  key={index}
                  className={cn(
                    "grid grid-cols-[2fr_1fr] lg:flex flex-col border rounded-sm mb-[16px] lg:table-row lg:border-x-[0] lg:border-t-[0] lg:mb-[0] p-3 lg:p-0",
                    !isActive || hiddenAdverts ? "opacity-60" : "",
                  )}
                >
                  <TableCell className="p-2 lg:p-4 align-top row-start-3 col-start-1 col-end-4 whitespace-nowrap">
                    <div>
                      <div className="mb-1 flex justify-between md:justify-normal ">
                        <span
                          className={cn(
                            "font-bold text-base leading-6",
                            adType.toLowerCase() === "buy" ? "text-buy" : "text-sell",
                          )}
                        >
                          {adType}
                        </span>
                        <span className="text-gray-900 text-base font-bold leading-6 ml-1"> {ad.account_currency}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between md:justify-normal gap-1">
                          <span className="text-xs font-bold md:font-normal leading-5 text-slate-500">Ad Id:</span>
                          <span className="text-xs md:text-sm leading-5 text-slate-500">{ad.id}</span>
                        </div>
                        <div className="flex items-center justify-between md:justify-normal gap-1">
                          <span className="text-xs font-bold md:font-normal leading-5 text-slate-500">Rate:</span>
                          <span className="text-xs md:text-sm font-bold leading-5 text-gray-900">{rate}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 lg:p-4 align-top row-start-2 col-start-1 col-end-4  whitespace-nowrap">
                    <div className="mb-2">
                      {availableData.current.toFixed(2)} / {availableData.total.toFixed(2)} USD
                    </div>
                    <div className="h-2 bg-[#E9ECEF] rounded-xs w-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-neutral-10 rounded-full"
                        style={{ width: `${Math.min(availableData.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between md:justify-normal gap-1">
                      <span className="text-xs font-bold md:font-normal leading-5 text-slate-500">Limit:</span>
                      <span className="text-xs md:text-sm font-bold md:font-normal leading-5 text-gray-900 overflow-hidden text-ellipsis">
                        {formatLimits(ad)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 lg:p-4 align-top row-start-4 col-span-full whitespace-nowrap">
                    {formatPaymentMethods(paymentMethods)}
                  </TableCell>
                  <TableCell className="p-2 lg:p-4 align-top row-start-1 col-span-full whitespace-nowrap">
                    {getStatusBadge(isActive)}
                  </TableCell>
                  <TableCell className="p-2 lg:p-4 align-top row-start-1 whitespace-nowrap">
                    {isMobile ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 hover:bg-gray-100 rounded-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={() => handleOpenDrawer(ad)}
                      >
                        <Image
                          src="/icons/ellipsis-vertical-md.png"
                          alt="More options"
                          width={20}
                          height={20}
                          className="text-gray-500"
                        />
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 hover:bg-gray-100 rounded-full focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            <Image
                              src="/icons/ellipsis-vertical-md.png"
                              alt="More options"
                              width={20}
                              height={20}
                              className="text-gray-500"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] p-1">
                          <AdActionsMenu
                            ad={ad}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-bold text-xl">Manage ads</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col">
            {selectedAd && (
              <AdActionsMenu
                ad={selectedAd}
                variant="drawer"
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteConfirmationDialog
        open={deleteConfirmModal.show}
        title="Delete ad?"
        description="You will not be able to restore it."
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  )
}
