"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdDetailsForm from "../components/ad-details-form"
import AdPaymentMethods from "../components/ad-payment-methods"
import PaymentDetailsForm from "../components/payment-details-form"
import ProgressSteps from "../components/progress-steps"
import { Button } from "@/components/ui/button"
import { createAd, updateAd, getAdById } from "../api/api-ads"
import type { AdFormData } from "../types"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

interface ValidationErrors {
  totalAmount?: string
  fixedRate?: string
  minAmount?: string
  maxAmount?: string
}

export default function CreateAdPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showAlert } = useAlertDialog()

  const adId = searchParams.get("id")
  const isEditMode = !!adId

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<AdFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (isEditMode && adId) {
      const loadAdData = async () => {
        try {
          const adData = await getAdById(adId)
          setFormData(adData)
        } catch (error) {
          showAlert({
            title: "Error",
            message: "Failed to load ad data. Please try again.",
            type: "warning",
          })
        }
      }
      loadAdData()
    }
  }, [adId, isEditMode, showAlert])

  useEffect(() => {
    const handleFormValidation = (event: CustomEvent) => {
      setIsFormValid(event.detail.isValid)
      setFormData((prev) => ({ ...prev, ...event.detail.formData }))
    }

    document.addEventListener("adFormValidationChange", handleFormValidation as EventListener)
    return () => {
      document.removeEventListener("adFormValidationChange", handleFormValidation as EventListener)
    }
  }, [])

  const handleNext = (stepData: Partial<AdFormData>, errors?: ValidationErrors) => {
    if (errors && Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    setFormData((prev) => ({ ...prev, ...stepData }))

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!isFormValid || Object.keys(validationErrors).length > 0) {
      showAlert({
        title: "Validation Error",
        message: "Please fix all validation errors before submitting.",
        type: "warning",
      })
      return
    }

    setIsLoading(true)
    try {
      let result
      if (isEditMode && adId) {
        result = await updateAd(adId, formData as AdFormData)
      } else {
        result = await createAd(formData as AdFormData)
      }

      const params = new URLSearchParams({
        success: "true",
        type: isEditMode ? "update" : "create",
        id: result.id || adId || "",
        showStatusModal: "true",
      })

      router.push(`/ads?${params.toString()}`)
    } catch (error) {
      showAlert({
        title: "Error",
        message: `Failed to ${isEditMode ? "update" : "create"} ad. Please try again.`,
        type: "warning",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AdDetailsForm onNext={handleNext} initialData={formData} isEditMode={isEditMode} />
      case 2:
        return <AdPaymentMethods onNext={handleNext} initialData={formData} />
      case 3:
        return <PaymentDetailsForm onNext={handleNext} initialData={formData} />
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Set ad type and amount"
      case 2:
        return "Set payment methods"
      case 3:
        return "Add payment details"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{isEditMode ? "Edit ad" : "Create new ad"}</h1>
          <p className="text-gray-600">{getStepTitle()}</p>
        </div>

        <div className="mb-8">
          <ProgressSteps currentStep={currentStep} totalSteps={3} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">{renderStepContent()}</div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => {
                const form = document.getElementById("ad-details-form") as HTMLFormElement
                if (form) {
                  form.requestSubmit()
                }
              }}
              disabled={!isFormValid || Object.keys(validationErrors).length > 0}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid || Object.keys(validationErrors).length > 0}
            >
              {isLoading ? "Submitting..." : isEditMode ? "Update ad" : "Create ad"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
