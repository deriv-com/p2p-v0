"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface PreviousOrdersSectionProps {
  onBack: () => void
}

export function PreviousOrdersSection({ onBack }: PreviousOrdersSectionProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6 px-3">
        <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            className="bg-grayscale-300 px-1"
          >
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
      </div>

      <div className="flex-1 px-3
        <h1 className="text-xl font-bold">Previous orders</h1>
        <div className="mt-8 bg-white rounded-lg p-4">
          <iframe
            src="https://staging-p2p.deriv.com/"
            className="w-full h-96 border-0 rounded-lg"
            title="Previous Orders"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </div>
  )
}
