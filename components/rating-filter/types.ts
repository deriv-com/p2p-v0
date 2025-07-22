import type React from "react"
export interface RatingOption {
  value: number
  label: string
  count?: number
}

export interface RatingFilterProps {
  ratings: RatingOption[]
  selectedRating: number | null
  onRatingSelect: (rating: number | null) => void
  trigger: React.ReactNode
  placeholder?: string
  emptyMessage?: string
}
