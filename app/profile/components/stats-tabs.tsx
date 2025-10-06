"use client"
import { useState } from "react"
import StatsGrid from "./stats-grid"
import PaymentMethodsTab from "./payment-methods-tab"
import FollowsTab from "./follows-tab"
import BlockedTab from "./blocked-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Divider } from "@/components/ui/divider"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import { ProfileAPI } from "@/services/api"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface StatsTabsProps {
  stats?: any
}

export default function StatsTabs({ stats, isLoading }: StatsTabsProps) {
  const isMobile = useIsMobile()
  const { showAlert, hideAlert } = useAlertDialog()
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showStatsSidebar, setShowStatsSidebar] = useState(false)
  const [showPaymentMethodsSidebar, setShowPaymentMethodsSidebar] = useState(false)
  const [showFollowsSidebar, setShowFollowsSidebar] = useState(false)
  const [showBlockedSidebar, setShowBlockedSidebar] = useState(false)
  const { toast } = useToast()
  const [showAddPaymentSheet, setShowAddPaymentSheet] = useState(false)
  const [showPaymentDetailsSheet, setShowPaymentDetailsSheet] = useState(false)
  const [selectedMethodForDetails, setSelectedMethodForDetails] = useState<string | null>(null)

  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "payment", label: "Payment methods" },
    { id: "follows", label: "Follows" },
    { id: "blocked", label: "Blocked" }
  ]

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingPaymentMethod(true)

      const result = await ProfileAPI.addPaymentMethod(method, fields)

      if (result.success) {
        if (isMobile) {
          setShowPaymentDetailsSheet(false)
          setShowAddPaymentSheet(false)
        } else {
          hideAlert()
        }

        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/success-checkmark.png" alt="Success" width={24} height={24} className="text-white" />
              <span>Payment method added.</span>
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
        })

        setRefreshKey((prev) => prev + 1)
      } else {
        let title = "Unable to add payment method"
        let description = "There was an error when adding the payment method. Please try again."

        if (result.errors.length > 0 && result.errors[0].code === "PaymentMethodDuplicate") {
          title = "Duplicate payment method"
          description = "A payment method with the same values already exists. Add a new one."
        }
        showAlert({
          title,
          description,
          confirmText: "OK",
          type: "warning",
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  const handleShowAddPaymentMethod = () => {
    if (isMobile) {
      setShowAddPaymentSheet(true)
    } else {
      showAlert({
        title: "Select a payment method",
        description: (
          <AddPaymentMethodPanel
            onAdd={handleAddPaymentMethod}
            isLoading={isAddingPaymentMethod}
            onMethodSelect={(method) => {
              showAlert({
                title: "Add payment details",
                description: (
                  <AddPaymentMethodPanel
                    onAdd={handleAddPaymentMethod}
                    isLoading={isAddingPaymentMethod}
                    selectedMethod={method}
                    onBack={() => handleShowAddPaymentMethod()}
                  />
                ),
                showCloseButton: true,
              })
            }}
          />
        ),
        showCloseButton: true,
      })
    }
  }

  return (
    <div className="relative">
      <div className="mb-6">
        {isMobile ? (
          <div className="mx-[-12px]">
            <Divider />
            <div
              onClick={() => {
                setShowStatsSidebar(true)
              }}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-normal text-gray-900">Stats</span>
              <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
            </div>
            {showStatsSidebar && (
              <div className="fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col inset-0 w-full">
                <div className="flex items-center gap-4 px-4 py-3 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStatsSidebar(false)}
                    className="bg-grayscale-300 px-1"
                  >
                    <Image src="/icons/arrow-left-icon.png" alt="Close" width={24} height={24} />
                  </Button>
                  <h2 className="text-xl font-bold">Stats</h2>
                </div>
                <div className="m-4">
                  <StatsGrid stats={stats} />
                </div>
              </div>
            )}
            <Divider />
            <div
              onClick={() => {
                setShowPaymentMethodsSidebar(true)
              }}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-normal text-gray-900">Payment methods</span>
              <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
            </div>
            {showPaymentMethodsSidebar && (
              <div className="fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col inset-0 w-full">
                <div className="flex items-center gap-4 px-4 py-3 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPaymentMethodsSidebar(false)}
                    className="bg-grayscale-300 px-1"
                  >
                    <Image src="/icons/arrow-left-icon.png" alt="Close" width={24} height={24} />
                  </Button>
                  <h2 className="text-xl font-bold">Payment methods</h2>
                </div>
                <div className="m-4 flex-1 overflow-auto">
                  <PaymentMethodsTab key={refreshKey} />
                </div>
                <div className="p-4">
                  <Button
                    onClick={handleShowAddPaymentMethod}
                    variant="outline"
                    className="w-full rounded-full bg-transparent"
                  >
                    Add payment method
                  </Button>
                </div>
              </div>
            )}
            <Divider />
            <div
              onClick={() => {
                setShowFollowsSidebar(true)
              }}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-normal text-gray-900">Follows</span>
              <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
            </div>
            {showFollowsSidebar && (
              <div className="fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col inset-0 w-full">
                <div className="flex items-center gap-4 px-4 py-3 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFollowsSidebar(false)}
                    className="bg-grayscale-300 px-1"
                  >
                    <Image src="/icons/arrow-left-icon.png" alt="Close" width={24} height={24} />
                  </Button>
                  <h2 className="text-xl font-bold">Follows</h2>
                </div>
                <div className="m-4 flex-1 overflow-auto">
                  <FollowsTab />
                </div>
              </div>
            )}
            <Divider />
            <div
              onClick={() => {
                setShowBlockedSidebar(true)
              }}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-normal text-gray-900">Blocked</span>
              <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
            </div>
            {showBlockedSidebar && (
              <div className="fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col inset-0 w-full">
                <div className="flex items-center gap-4 px-4 py-3 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBlockedSidebar(false)}
                    className="bg-grayscale-300 px-1"
                  >
                    <Image src="/icons/arrow-left-icon.png" alt="Close" width={24} height={24} />
                  </Button>
                  <h2 className="text-xl font-bold">Blocked</h2>
                </div>
                <div className="m-4 flex-1 overflow-auto">
                  <BlockedTab />
                </div>
              </div>
            )}
            <Divider />
          </div>
        ) : (
          <Tabs defaultValue="stats">
            <TabsList className="bg-[#F5F5F5] rounded-2xl p-2 h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="py-2 px-4 rounded-xl transition-all font-normal text-base data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="stats" className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="bg-[#F5F5F5] rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="py-4">
                          <div className="animate-pulse bg-slate-200 h-4 w-3/4 mb-2 rounded"></div>
                          <div className="animate-pulse bg-slate-200 h-8 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-slate-200 py-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="py-4">
                          <div className="animate-pulse bg-slate-200 h-4 w-3/4 mb-2 rounded"></div>
                          <div className="animate-pulse bg-slate-200 h-8 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="py-4">
                          <div className="animate-pulse bg-slate-200 h-4 w-3/4 mb-2 rounded"></div>
                          <div className="animate-pulse bg-slate-200 h-8 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-lg border py-4">
                  <StatsGrid stats={stats} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="payment" className="mt-4">
              <div className="relative rounded-lg border p-4">
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={handleShowAddPaymentMethod}>
                    <Image src="/icons/plus_icon.png" alt="Add payment" width={14} height={24} className="mr-1" />
                    Add payment
                  </Button>
                </div>
                <PaymentMethodsTab key={refreshKey} />
              </div>
            </TabsContent>

            <TabsContent value="follows" className="mt-4">
              <div className="relative rounded-lg border p-4">
                <FollowsTab />
              </div>
            </TabsContent>

            <TabsContent value="blocked" className="mt-4">
              <div className="relative rounded-lg border p-4">
                <BlockedTab />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Sheet open={showAddPaymentSheet} onOpenChange={setShowAddPaymentSheet}>
        <SheetContent side="right" className="w-full h-full">
          <div className="mt-4 h-[calc(100%-60px)] overflow-y-auto">
            <div>Select a payment method</div>
            <AddPaymentMethodPanel
              onAdd={handleAddPaymentMethod}
              isLoading={isAddingPaymentMethod}
              onMethodSelect={(method) => {
                setSelectedMethodForDetails(method)
                setShowAddPaymentSheet(false)
                setShowPaymentDetailsSheet(true)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showPaymentDetailsSheet} onOpenChange={setShowPaymentDetailsSheet}>
        <SheetContent side="right" className="w-full h-full">
          <div className="mt-4 h-[calc(100%-60px)] overflow-y-auto">
            <div>Add payment details</div>
            <AddPaymentMethodPanel
              onAdd={handleAddPaymentMethod}
              isLoading={isAddingPaymentMethod}
              selectedMethod={selectedMethodForDetails}
              onBack={() => {
                setShowPaymentDetailsSheet(false)
                setShowAddPaymentSheet(true)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
