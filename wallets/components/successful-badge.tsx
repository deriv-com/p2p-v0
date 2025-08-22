import { Badge } from "@/components/ui/badge"

export function SuccessfulBadge() {
  return (
    <Badge className="flex h-6 justify-center items-center gap-2 border-transparent bg-walletBadge-successful-bg text-walletBadge-successful-text px-2.5 py-0.5">
      Successful
    </Badge>
  )
}
