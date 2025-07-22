"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AddPaymentMethodModal } from "@/app/profile/components/add-payment-method-modal"
import { EditPaymentMethodPanel } from "@/app/profile/components/edit-payment-method-panel"
import { BankTransferEditPanel } from "@/app/profile/components/bank-transfer-edit-panel"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import {
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  addPaymentMethod,
  type PaymentMethod,
} from "@/app/profile/api/api-payment-methods"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { showAlert, showDeleteDialog } = useAlertDialog()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const methods = await getPaymentMethods()
      setPaymentMethods(methods)
    } catch (error) {
      showAlert({
        type: "warning",
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        confirmText: "OK",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePaymentMethod = async (methodId: string, updates: Partial<PaymentMethod>) => {
    try {
      await updatePaymentMethod(methodId, updates)
      await fetchPaymentMethods()
      setIsEditPanelOpen(false)
      setEditingMethod(null)
    } catch (error) {
      showAlert({
        type: "warning",
        title: "Update Failed",
        description: "Failed to update payment method. Please try again.",
        confirmText: "OK",
      })
    }
  }

  const handleDeletePaymentMethod = (methodId: string, methodName: string) => {
    showDeleteDialog({
      title: "Delete payment method?",
      description: `Are you sure you want to delete ${methodName}? This action cannot be undone.`,
      onConfirm: () => confirmDeletePaymentMethod(methodId),
    })
  }

  const confirmDeletePaymentMethod = async (methodId: string) => {
    try {
      await deletePaymentMethod(methodId)
      await fetchPaymentMethods()
    } catch (error) {
      showAlert({
        type: "warning",
        title: "Delete Failed",
        description: "Failed to delete payment method. Please try again.",
        confirmText: "OK",
      })
    }
  }

  const handleAddPaymentMethod = async (methodData: Omit<PaymentMethod, "id">) => {
    try {
      await addPaymentMethod(methodData)
      await fetchPaymentMethods()
      setIsAddModalOpen(false)
    } catch (error) {
      showAlert({
        type: "warning",
        title: "Add Failed",
        description: "Failed to add payment method. Please try again.",
        confirmText: "OK",
      })
    }
  }

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method)
    setIsEditPanelOpen(true)
  }

  const getFilteredMethods = () => {
    if (activeTab === "all") return paymentMethods
    return paymentMethods.filter((method) => method.type.toLowerCase() === activeTab)
  }

  const getMethodIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "bank_transfer":
        return "/icons/bank-transfer-icon.png"
      case "ewallet":
        return "/icons/ewallet-icon.png"
      default:
        return "/icons/bank-transfer-icon.png"
    }
  }

  const getMethodTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "bank_transfer":
        return "Bank Transfer"
      case "ewallet":
        return "E-Wallet"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <Image src="/icons/arrow-left-icon.png" alt="Back" width={20} height={20} />
          </Button>
          <h1 className="text-2xl font-bold">Payment methods</h1>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <Image src="/icons/arrow-left-icon.png" alt="Back" width={20} height={20} />
          </Button>
          <h1 className="text-2xl font-bold">Payment methods</h1>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800 text-white">
          <Image src="/icons/plus_icon.png" alt="Add" width={16} height={16} className="mr-2" />
          Add new
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="bank_transfer">Bank Transfer</TabsTrigger>
          <TabsTrigger value="ewallet">E-Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {getFilteredMethods().length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-500 mb-4">
                  <Image
                    src="/icons/bank-transfer-icon.png"
                    alt="No payment methods"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p className="text-lg font-medium">No payment methods found</p>
                  <p className="text-sm">Add a payment method to start trading</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800 text-white">
                  Add payment method
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredMethods().map((method) => (
                <Card key={method.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <Image
                            src={getMethodIcon(method.type) || "/placeholder.svg"}
                            alt={method.type}
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{method.display_name}</h3>
                            <Badge variant={method.is_enabled ? "default" : "secondary"} className="text-xs">
                              {method.is_enabled ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{getMethodTypeLabel(method.type)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditMethod(method)}>
                          <Image src="/icons/pencil.png" alt="Edit" width={16} height={16} className="mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id, method.display_name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Image src="/icons/trash-red.png" alt="Delete" width={16} height={16} />
                        </Button>
                      </div>
                    </div>

                    {method.fields && Object.keys(method.fields).length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {Object.entries(method.fields).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-600 capitalize">{key.replace(/_/g, " ")}:</span>
                              <span className="ml-2 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddPaymentMethodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPaymentMethod}
      />

      {editingMethod && (
        <>
          {editingMethod.type === "bank_transfer" ? (
            <BankTransferEditPanel
              isOpen={isEditPanelOpen}
              onClose={() => {
                setIsEditPanelOpen(false)
                setEditingMethod(null)
              }}
              paymentMethod={editingMethod}
              onUpdate={(updates) => handleUpdatePaymentMethod(editingMethod.id, updates)}
            />
          ) : (
            <EditPaymentMethodPanel
              isOpen={isEditPanelOpen}
              onClose={() => {
                setIsEditPanelOpen(false)
                setEditingMethod(null)
              }}
              paymentMethod={editingMethod}
              onUpdate={(updates) => handleUpdatePaymentMethod(editingMethod.id, updates)}
            />
          )}
        </>
      )}
    </div>
  )
}
