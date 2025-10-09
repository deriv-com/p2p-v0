"use client"

import { useSearchParams } from "next/navigation"
import MultiStepAdForm from "@/app/ads/components/shared/multi-step-ad-form"

export default function CreateAdPage() {
  const searchParams = useSearchParams()
  const operation = searchParams.get("operation")
  const initialType = operation === "sell" ? "sell" : "buy"

  return <MultiStepAdForm mode="create" initialType={initialType} />
}
