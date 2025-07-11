"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import AdDetailsForm from "@/app/ads/components/ad-details-form"
import PaymentDetailsForm from "@/app/ads/components/payment-details-form"
import ProgressSteps from "@/app/ads/components/progress-steps"
import { CustomStatusModal } from "@/app/ads/components/ui/custom-status-modal"
import { CustomStatusBottomSheet } from "@/app/ads/components/ui/custom-status-bottom-sheet"
import { createAd, updateAd, getAdById } from "@/app/ads/api/api-ads"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface AdFormData {
  trade_type: "buy" | "sell"
  total_amount: string
  fixed_rate: string
  min_order_amount: string
  max_order_amount: string
  payment_method_ids: number[]
  instructions?: string
}

export default function CreateAdPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusType, setStatusType] = useState<"success" | "error">("success")
  const [statusMessage, setStatusMessage] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [editAdId, setEditAdId] = useState<string | null>(null)

  const [formData, setFormData] = useState<AdFormData>({
    trade_type: "buy",
    total_amount: "",
    fixed_rate: "",
    min_order_amount: "",
    max_order_amount: "",
    payment_method_ids: [],
    instructions: "",
  })

  useEffect(() => {
    const adId = searchParams.get("edit")
    if (adId) {
      setIsEditMode(true)
      setEditAdId(adId)
      loadAdForEdit(adId)
    }
  }, [searchParams])

  const loadAdForEdit = async (adId: string) => {
    try {
      setIsLoading(true)
      const ad = await getAdById(adId)
      setFormData({
        trade_type: ad.trade_type,
        total_amount: ad.total_amount.toString(),
        fixed_rate: ad.fixed_rate.toString(),
        min_order_amount: ad.min_order_amount.toString(),
        max_order_amount: ad.max_order_amount.toString(),
        payment_method_ids: ad.payment_method_ids || [],
        instructions: ad.instructions || "",
      })
    } catch (error) {
      console.error("Failed to load ad for editing:", error)
      setStatusType("error")
      setStatusMessage("Failed to load ad details")
      setShowStatusModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const handleFormDataChange = (data: Partial<AdFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      const submitData = {
        ...formData,
        total_amount: Number.parseFloat(formData.total_amount),
        fixed_rate: Number.parseFloat(formData.fixed_rate),
        min_order_amount: Number.parseFloat(formData.min_order_amount),
        max_order_amount: Number.parseFloat(formData.max_order_amount),
      }

      let result
      if (isEditMode && editAdId) {
        result = await updateAd(editAdId, submitData)
      } else {
        result = await createAd(submitData)
      }

      if (result.success) {
        setStatusType("success")
        setStatusMessage(isEditMode ? "Ad updated successfully!" : "Ad created successfully!")
        setShowStatusModal(true)
      } else {
        throw new Error(result.message || "Failed to save ad")
      }
    } catch (error) {
      console.error("Failed to submit ad:", error)
      setStatusType("error")
      setStatusMessage(error instanceof Error ? error.message : "Failed to save ad")
      setShowStatusModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusModalClose = () => {
    setShowStatusModal(false)
    if (statusType === "success") {
      router.push("/ads/my-ads")
    }
  }

  if (isLoading && isEditMode) {
    return (
      <div className="absolute left-0 right-0 top-0 bottom-0 bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading ad details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 bg-white">
      <div className="container mx-auto px-4 py-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">{isEditMode ? "Edit Ad" : "Create Ad"}</h1>
          <div className="w-16" />
        </div>

        <ProgressSteps currentStep={currentStep} totalSteps={2} />

        <div className="flex-1 mt-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{currentStep === 1 ? "Ad Details" : "Payment Details"}</CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto">
              {currentStep === 1 ? (
                <AdDetailsForm formData={formData} onChange={handleFormDataChange} />
              ) : (
                <PaymentDetailsForm formData={formData} onChange={handleFormDataChange} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep === 1 ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : isEditMode ? "Update Ad" : "Create Ad"}
            </Button>
          )}
        </div>

        {isMobile ? (
          <CustomStatusBottomSheet
            isOpen={showStatusModal}
            onClose={handleStatusModalClose}
            type={statusType}
            message={statusMessage}
          />
        ) : (
          <CustomStatusModal
            isOpen={showStatusModal}
            onClose={handleStatusModalClose}
            type={statusType}
            message={statusMessage}
          />
        )}
      </div>
    </div>
  )
}
