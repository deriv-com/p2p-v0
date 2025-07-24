"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdDetailsForm } from "../components/ad-details-form"
import { PaymentDetailsForm } from "../components/payment-details-form"
import { ProgressSteps } from "../components/progress-steps"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { createAd, updateAd, getAdById } from "../api/api-ads"
import type { Ad, CreateAdRequest, UpdateAdRequest } from "../types"

const STEPS = [
  { id: 1, title: "Ad Details", description: "Set your ad preferences" },
  { id: 2, title: "Payment Methods", description: "Choose payment options" },
  { id: 3, title: "Review", description: "Review and publish" },
]

export default function CreateAdPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showAlert } = useAlertDialog()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAd, setIsLoadingAd] = useState(false)

  // Form data state
  const [adDetails, setAdDetails] = useState({
    type: "buy" as "buy" | "sell",
    currency: "USD",
    amount: "",
    rate: "",
    minOrder: "",
    maxOrder: "",
    instructions: "",
    counterpartyConditions: "",
  })

  const [paymentMethods, setPaymentMethods] = useState<string[]>([])

  // Check if we're editing an existing ad
  const adId = searchParams.get("id")
  const isEditing = Boolean(adId)

  // Load existing ad data if editing
  useEffect(() => {
    if (isEditing && adId) {
      loadAdData(adId)
    }
  }, [isEditing, adId])

  const loadAdData = async (id: string) => {
    setIsLoadingAd(true)
    try {
      const ad = await getAdById(id)
      if (ad) {
        setAdDetails({
          type: ad.type,
          currency: ad.currency,
          amount: ad.amount.toString(),
          rate: ad.rate.toString(),
          minOrder: ad.minOrder.toString(),
          maxOrder: ad.maxOrder.toString(),
          instructions: ad.instructions || "",
          counterpartyConditions: ad.counterpartyConditions || "",
        })
        setPaymentMethods(ad.paymentMethods || [])
      }
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to load ad data. Please try again.",
        type: "warning",
      })
    } finally {
      setIsLoadingAd(false)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAdDetailsSubmit = (data: typeof adDetails) => {
    setAdDetails(data)
    handleNext()
  }

  const handlePaymentMethodsSubmit = (methods: string[]) => {
    setPaymentMethods(methods)
    handleNext()
  }

  const handlePublish = async () => {
    setIsLoading(true)

    try {
      const adData = {
        type: adDetails.type,
        currency: adDetails.currency,
        amount: Number.parseFloat(adDetails.amount),
        rate: Number.parseFloat(adDetails.rate),
        minOrder: Number.parseFloat(adDetails.minOrder),
        maxOrder: Number.parseFloat(adDetails.maxOrder),
        instructions: adDetails.instructions,
        counterpartyConditions: adDetails.counterpartyConditions,
        paymentMethods,
      }

      let result: Ad

      if (isEditing && adId) {
        result = await updateAd(adId, adData as UpdateAdRequest)
      } else {
        result = await createAd(adData as CreateAdRequest)
      }

      // Show success alert
      showAlert({
        title: "Success",
        message: isEditing ? "Ad updated successfully!" : "Ad created successfully!",
        type: "success",
      })

      // Navigate to ads page with success parameters
      const params = new URLSearchParams({
        success: "true",
        type: isEditing ? "updated" : "created",
        id: result.id,
        showStatusModal: "true",
      })

      router.push(`/ads?${params.toString()}`)
    } catch (error) {
      console.error("Error publishing ad:", error)
      showAlert({
        title: "Error",
        message: isEditing ? "Failed to update ad. Please try again." : "Failed to create ad. Please try again.",
        type: "warning",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingAd) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ad data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{isEditing ? "Edit Ad" : "Create New Ad"}</h1>
          <p className="text-gray-600">{isEditing ? "Update your ad details" : "Set up your P2P trading ad"}</p>
        </div>

        <ProgressSteps steps={STEPS} currentStep={currentStep} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <AdDetailsForm initialData={adDetails} onSubmit={handleAdDetailsSubmit} isLoading={isLoading} />
            )}

            {currentStep === 2 && (
              <PaymentDetailsForm
                selectedMethods={paymentMethods}
                onSubmit={handlePaymentMethodsSubmit}
                onPrevious={handlePrevious}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review Your Ad</h3>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <p className="text-gray-900 capitalize">{adDetails.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Currency</label>
                        <p className="text-gray-900">{adDetails.currency}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Amount</label>
                        <p className="text-gray-900">{adDetails.amount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Rate</label>
                        <p className="text-gray-900">{adDetails.rate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Min Order</label>
                        <p className="text-gray-900">{adDetails.minOrder}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Max Order</label>
                        <p className="text-gray-900">{adDetails.maxOrder}</p>
                      </div>
                    </div>

                    {adDetails.instructions && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Instructions</label>
                        <p className="text-gray-900">{adDetails.instructions}</p>
                      </div>
                    )}

                    {adDetails.counterpartyConditions && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Counterparty Conditions</label>
                        <p className="text-gray-900">{adDetails.counterpartyConditions}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Methods</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {paymentMethods.map((method) => (
                          <span key={method} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevious} disabled={isLoading}>
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditing ? "Updating..." : "Publishing..."}
                      </div>
                    ) : isEditing ? (
                      "Update Ad"
                    ) : (
                      "Publish Ad"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
