"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteAdvert, updateAdvertStatus } from "../api/api-ads"
import type { MyAd } from "../types"
import DeleteConfirmationDialog from "./ui/delete-confirmation-dialog"
import StatusBottomSheet from "./ui/status-bottom-sheet"
import { useRouter } from "next/navigation"

interface MyAdsTableProps {
  ads: MyAd[]
  onAdDeleted: (status?: string) => void
}

export default function MyAdsTable({ ads, onAdDeleted }: MyAdsTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    ad: MyAd | null
  }>({
    isOpen: false,
    ad: null,
  })
  const [statusSheet, setStatusSheet] = useState<{
    isOpen: boolean
    ad: MyAd | null
  }>({
    isOpen: false,
    ad: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const router = useRouter()

  const handleDeleteClick = (ad: MyAd) => {
    setDeleteDialog({ isOpen: true, ad })
  }

  const handleStatusClick = (ad: MyAd) => {
    setStatusSheet({ isOpen: true, ad })
  }

  const handleEditClick = (ad: MyAd) => {
    router.push(`/ads/create?edit=${ad.id}`)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.ad) return

    try {
      setIsDeleting(true)
      await deleteAdvert(deleteDialog.ad.id)
      setDeleteDialog({ isOpen: false, ad: null })
      onAdDeleted("deleted")
    } catch (error) {
      console.error("Error deleting ad:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusUpdate = async (newStatus: "active" | "inactive") => {
    if (!statusSheet.ad) return

    try {
      setIsUpdatingStatus(true)
      await updateAdvertStatus(statusSheet.ad.id, newStatus)
      setStatusSheet({ isOpen: false, ad: null })
      onAdDeleted() // Refresh the list
    } catch (error) {
      console.error("Error updating ad status:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="success">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "archived":
        return <Badge variant="destructive">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Payment methods</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.id}</TableCell>
                <TableCell>
                  <Badge variant={ad.type === "buy" ? "default" : "secondary"}>
                    {ad.type === "buy" ? "Buy" : "Sell"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatCurrency(ad.min_order_amount, ad.account_currency)} -{" "}
                  {formatCurrency(ad.max_order_amount, ad.account_currency)}
                </TableCell>
                <TableCell>{formatCurrency(ad.rate, ad.local_currency)}</TableCell>
                <TableCell>{formatCurrency(ad.remaining_amount, ad.account_currency)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {ad.payment_method_names?.slice(0, 2).map((method, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                    {ad.payment_method_names && ad.payment_method_names.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{ad.payment_method_names.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <button onClick={() => handleStatusClick(ad)} className="hover:opacity-80">
                    {getStatusBadge(ad.status)}
                  </button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(ad)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(ad)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, ad: null })}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        adId={deleteDialog.ad?.id || ""}
      />

      <StatusBottomSheet
        isOpen={statusSheet.isOpen}
        onClose={() => setStatusSheet({ isOpen: false, ad: null })}
        currentStatus={statusSheet.ad?.status || ""}
        onStatusUpdate={handleStatusUpdate}
        isLoading={isUpdatingStatus}
      />
    </>
  )
}
