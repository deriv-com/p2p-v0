import { Badge } from "@/components/ui/badge"

export function ProcessingBadge() {
  return (
    <Badge className="flex h-6 justify-center items-center gap-2 border-transparent bg-walletBadge-processing-bg text-walletBadge-processing-text px-2.5 py-0.5 rounded">
      Processing
    </Badge>
  )
}
