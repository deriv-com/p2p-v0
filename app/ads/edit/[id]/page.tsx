"use client"

export const runtime = 'edge'

import { useParams } from "next/navigation"
import MultiStepAdForm from "@/app/ads/components/shared/multi-step-ad-form"

export default function EditAdPage() {
  const { id } = useParams() as { id: string }

  return <MultiStepAdForm mode="edit" adId={id} />
}
