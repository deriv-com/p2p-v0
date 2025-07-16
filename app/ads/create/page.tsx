"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { ProgressSteps } from "../components/progress-steps"
import { AdDetailsForm } from "../components/ad-details-form"
import { AdPaymentMethods } from "../components/ad-payment-methods"
import { PaymentDetailsForm } from "../components/payment-details-form"
import { createAd, updateAd } from "../api/api-ads"
import { StatusModal } from "../components/ui/status-modal"
import { StatusBottomSheet } from "../components/ui/status-bottom-sheet"
import { useMobile } from "@/hooks/use-mobile"
import type { CreateAdPayload } from "@/services/api/api-my-ads"

interface AdFormData {
  type: "buy" | "sell"
  amount: string
  minOrder: string
  maxOrder: string
  rate: string
  paymentMethods: string[]
  instructions: string
  counterpartyConditions: string
}

const initialFormData: AdFormData = {
  type: "buy",
  amount: "",
  minOrder: "",
  maxOrder: "",
  rate: "",
  paymentMethods: [],
  instructions: "",
  counterpartyConditions: "",
}

export default function CreateAdPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<AdFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusModal, setStatusModal] = useState<{
    show: boolean
    type: "success" | "error"
    title: string
    message: string
  }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useMobile()

  // Check if we're in edit mode
  const editId = searchParams.get("edit")
  const isEditMode = !!editId

  useEffect(() => {
    if (isEditMode) {
      // In a real app, you would fetch the ad data here
      // For now, we'll just set some default values
      console.log("Edit mode detected for ad:", editId)
    }
  }, [editId, isEditMode])

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormDataChange = (updates: Partial<AdFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const payload: CreateAdPayload = {
        type: formData.type,
        amount: Number.parseFloat(formData.amount) || 0,
        minimum_order_amount: Number.parseFloat(formData.minOrder) || 0,
        maximum_order_amount: Number.parseFloat(formData.maxOrder) || 0,
        exchange_rate: Number.parseFloat(formData.rate) || 0,
        payment_method_names: formData.paymentMethods,
        description: formData.instructions,
        counterparty_conditions: formData.counterpartyConditions,
      }

      let result
      if (isEditMode && editId) {
        result = await updateAd(editId, payload)
      } else {
        result = await createAd(payload)
      }

      if (result.success) {
        // Store success data in localStorage for the ads page to read
        const successData = {
          success: isEditMode ? "update" : "create",
          type: formData.type,
          id: isEditMode ? editId : result.data.id,
          timestamp: Date.now(),
        }
        localStorage.setItem("adCreationSuccess", JSON.stringify(successData))

        // Navigate to ads page
        router.push("/ads")
      } else {
        const errorMessage = result.errors?.[0]?.message || "Failed to create ad"

        if (errorMessage === "ad_limit_reached") {
          setStatusModal({
            show: true,
            type: "error",
            title: "Ad Limit Reached",
            message:
              "You've reached the maximum number of ads allowed. Please delete some existing ads before creating new ones.",
          })
        } else {
          setStatusModal({
            show: true,
            type: "error",
            title: isEditMode ? "Failed to Update Ad" : "Failed to Create Ad",
            message: errorMessage,
          })
        }
      }
    } catch (error) {
      console.error("Error submitting ad:", error)
      setStatusModal({
        show: true,
        type: "error",
        title: isEditMode ? "Failed to Update Ad" : "Failed to Create Ad",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setStatusModal({ show: false, type: "success", title: "", message: "" })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AdDetailsForm formData={formData} onChange={handleFormDataChange} onNext={handleNext} />
      case 2:
        return (
          <AdPaymentMethods
            selectedMethods={formData.paymentMethods}
            onChange={(methods) => handleFormDataChange({ paymentMethods: methods })}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 3:
        return (
          <PaymentDetailsForm
            formData={formData}
            onChange={handleFormDataChange}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Ad" : "Create New Ad"}</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <ProgressSteps currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Form Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Ad Details"}
              {currentStep === 2 && "Payment Methods"}
              {currentStep === 3 && "Payment Details"}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Status Modal - Desktop */}
        {!isMobile && statusModal.show && (
          <StatusModal
            isOpen={true}
            onClose={handleCloseModal}
            title={statusModal.title}
            message={statusModal.message}
            type={statusModal.type}
          />
        )}

        {/* Status Bottom Sheet - Mobile */}
        {isMobile && statusModal.show && (
          <StatusBottomSheet
            isOpen={true}
            onClose={handleCloseModal}
            title={statusModal.title}
            message={statusModal.message}
            type={statusModal.type}
          />
        )}
      </div>
    </div>
  )
}
