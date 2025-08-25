import { Badge } from "@/components/ui/badge"

export function FailedBadge() {
  return (
    <Badge className="flex h-6 justify-center items-center gap-2 border-transparent bg-walletBadge-failed-bg text-walletBadge-failed-text px-2.5 py-0.5 rounded">
      Failed
    </Badge>
  )
}
