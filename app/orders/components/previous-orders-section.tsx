"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

interface PreviousOrdersSectionProps {
  onBack: () => void
}

export function PreviousOrdersSection({ onBack }: PreviousOrdersSectionProps) {
  const { t } = useTranslations()
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production"
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6 px-3">
        <Button variant="ghost" onClick={onBack} size="sm" className="bg-grayscale-300 px-1">
          <Image src="/icons/arrow-left-icon.png" alt="Close" width={24} height={24} />
        </Button>
      </div>

      <div className="flex-1 px-3">
        <h1 className="text-xl font-bold">{t("orders.previousOrders")}</h1>
        <div className="mt-8 bg-white rounded-lg p-4">
          <iframe
            src={
              isProduction
                ? "https://p2p.deriv.com/orders?from=p2p-v2"
                : "https://staging-p2p.deriv.com/orders?from=p2p-v2"
            }
            className="w-full h-[90vh] border-0 rounded-lg"
            title="Previous Orders"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </div>
  )
}
