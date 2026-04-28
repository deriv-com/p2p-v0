"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "@/lib/i18n/use-translations"

const ALLOWED_CHARS_RE = new RegExp("^[\\p{L}\\p{Nd}\\s@\\-\\.\\!\\/%&,_()+:;]{0,300}$", "u")
const MAX_REVIEW_LENGTH = 300

export interface FeedbackSurveyProps {
  onSubmit: (npsScore: number, reviewText: string) => void
  onClose: () => void
  isSubmitting: boolean
}

export function FeedbackSurvey({ onSubmit, onClose, isSubmitting }: FeedbackSurveyProps) {
  const { t } = useTranslations()
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const trimmedReview = reviewText.trim()
  const isReviewValid = ALLOWED_CHARS_RE.test(reviewText) && trimmedReview.length > 0
  const canSubmit = selectedScore !== null && isReviewValid && !isSubmitting

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length > MAX_REVIEW_LENGTH) return
    setReviewText(value)
    if (value.length === 0) {
      setValidationError(null)
    } else if (!ALLOWED_CHARS_RE.test(value)) {
      setValidationError(t("nps.validationError"))
    } else {
      setValidationError(null)
    }
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit(selectedScore!, trimmedReview)
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 px-6 pb-4 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
              <button
                key={score}
                type="button"
                disabled={isSubmitting}
                onClick={() => setSelectedScore(score)}
                className={cn(
                  "h-10 w-10 rounded-full border text-sm font-bold transition-colors disabled:opacity-50",
                  selectedScore === score
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent border-slate-300 text-slate-700 hover:border-primary hover:text-primary"
                )}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-grayscale-100">
            <span>{t("nps.notLikely")}</span>
            <span>{t("nps.veryLikely")}</span>
          </div>
        </div>

        <div className="space-y-1">
          <Textarea
            placeholder={t("nps.tellUsMore")}
            value={reviewText}
            onChange={handleReviewChange}
            disabled={isSubmitting}
            className="min-h-[100px] resize-none"
            maxLength={MAX_REVIEW_LENGTH}
          />
          {validationError ? (
            <p className="text-xs text-error">{validationError}</p>
          ) : (
            <p className="text-xs text-right text-grayscale-100">
              {reviewText.length}/{MAX_REVIEW_LENGTH}
            </p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-2">
        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full disabled:opacity-24">
          {isSubmitting ? (
            <Image src="/icons/spinner.png" alt="" width={20} height={20} className="animate-spin" />
          ) : (
            t("nps.sendFeedback")
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full text-sm font-normal disabled:opacity-50"
        >
          {t("nps.askMeLater")}
        </Button>
      </div>
    </div>
  )
}
