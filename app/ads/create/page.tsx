"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import AdDetailsForm from "../components/ad-details-form"
import AdPaymentMethods from "../components/ad-payment-methods"
import PaymentDetailsForm from "../components/payment-details-form"
import ProgressSteps from "../components/progress-steps"
import { createAdvert, updateAdvert, getAdvertById } from "../api/api-ads"
import { PaymentSelectionProvider } from "../components/payment-selection-context"
import type { CreateAdvertRequest, MyAd } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"

const STEPS = [
  { id: 1, title: "Ad details", description: "Set your ad type, currency and rate" },
  { id: 2, title: "Payment methods", description: "Choose how you want to receive payment" },
  { id: 3, title: "Payment details", description: "Add your payment information" },
]

export default function CreateAdPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adData, setAdData] = useState<Partial<CreateAdvertRequest>>({})
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [paymentDetails, setPaymentDetails] = useState<Record<string, any>>({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [editAdId, setEditAdId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true)

        // Check if we're in edit mode
        const mode = searchParams.get("mode")
        const id = searchParams.get("id")

        if (mode === "edit" && id) {
          setIsEditMode(true)
          setEditAdId(id)

          // Try to get data from localStorage first (for immediate editing)
          const storedData = localStorage.getItem("editAdData")
          if (storedData) {
            try {
              const editData = JSON.parse(storedData) as MyAd
              setAdData({
                type: editData.type,
                amount: editData.amount,
                min_order_amount: editData.min_order_amount,
                max_order_amount: editData.max_order_amount,
                rate: editData.rate,
                rate_type: editData.rate_type,
                description: editData.description,
                local_currency: editData.local_currency,
                account_currency: editData.account_currency,
              })
              setSelectedPaymentMethods(editData.payment_method_names || [])
              localStorage.removeItem("editAdData")
            } catch (err) {
              console.error("Error parsing stored edit data:", err)
            }
          }

          // Also fetch fresh data from API
          try {
            const freshAdData = await getAdvertById(id)
            setAdData({
              type: freshAdData.type,
              amount: freshAdData.amount,
              min_order_amount: freshAdData.min_order_amount,
              max_order_amount: freshAdData.max_order_amount,
              rate: freshAdData.rate,
              rate_type: freshAdData.rate_type,
              description: freshAdData.description,
              local_currency: freshAdData.local_currency,
              account_currency: freshAdData.account_currency,
            })
            setSelectedPaymentMethods(freshAdData.payment_method_names || [])
          } catch (err) {
            console.error("Error fetching ad data:", err)
          }
        }
      } catch (err) {
        console.error("Error in fetchAds:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [searchParams])

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/ads")
    }
  }

  const handleAdDataChange = (data: Partial<CreateAdvertRequest>) => {
    setAdData((prev) => ({ ...prev, ...data }))
  }

  const handlePaymentMethodsChange = (methods: string[]) => {
    setSelectedPaymentMethods(methods)
  }

  const handlePaymentDetailsChange = (details: Record<string, any>) => {
    setPaymentDetails(details)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const submitData: CreateAdvertRequest = {
        ...adData,
        payment_method_names: selectedPaymentMethods,
        payment_method_details: paymentDetails,
      } as CreateAdvertRequest

      console.log("Submitting ad data:", submitData)

      let result
      if (isEditMode && editAdId) {
        result = await updateAdvert(editAdId, submitData)
        console.log("Ad updated successfully:", result)

        // Navigate with success parameters for update
        const params = new URLSearchParams({
          success: "update",
          type: submitData.type,
          id: editAdId,
        })
        window.location.href = `/ads?${params.toString()}`
      } else {
        result = await createAdvert(submitData)
        console.log("Ad created successfully:", result)

        // Navigate with success parameters for create
        const params = new URLSearchParams({
          success: "create",
          type: submitData.type,
          id: result.id || "new",
        })
        window.location.href = `/ads?${params.toString()}`
      }
    } catch (error) {
      console.error("Error submitting ad:", error)
      // Handle error - could show error modal here
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return adData.type && adData.amount && adData.rate && adData.local_currency
      case 2:
        return selectedPaymentMethods.length > 0
      case 3:
        return Object.keys(paymentDetails).length > 0
      default:
        return false
    }
  }

  const isLastStep = currentStep === STEPS.length

  if (loading) {
    return (
      <div className="container mx-auto p-4 bg-white min-h-screen">
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <PaymentSelectionProvider>
      <div className="container mx-auto p-4 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isEditMode ? "Edit ad" : "Create ad"}</h1>
              <p className="text-gray-600">{isEditMode ? "Update your existing ad" : "Create a new P2P ad"}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <ProgressSteps steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <AdDetailsForm data={adData} onChange={handleAdDataChange} isEditMode={isEditMode} />
              )}
              {currentStep === 2 && (
                <AdPaymentMethods
                  selectedMethods={selectedPaymentMethods}
                  onChange={handlePaymentMethodsChange}
                  adType={adData.type || "buy"}
                />
              )}
              {currentStep === 3 && (
                <PaymentDetailsForm
                  selectedMethods={selectedPaymentMethods}
                  details={paymentDetails}
                  onChange={handlePaymentDetailsChange}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            {isLastStep ? (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {isEditMode ? "Update ad" : "Create ad"}
                  </div>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </PaymentSelectionProvider>
  )
}
