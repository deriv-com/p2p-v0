import Image from "next/image"
import { Alert } from "@/components/ui/alert"
import { formatDateTime } from "@/lib/utils"

interface TemporaryBanAlertProps {
  tempBanUntil: number
}

export function TemporaryBanAlert({ tempBanUntil }: TemporaryBanAlertProps) {
  const banUntil = formatDateTime(tempBanUntil)

  return (
    <Alert variant="warning" className="flex items-start gap-2">
      <Image src="/icons/warning-icon-new.png" alt="Warning" height={24} width={24} />
      <div className="text-sm mt-[2px]">
        {`Your account is temporarily restricted. Some actions will be unavailable until ${banUntil}.`}
      </div>
    </Alert>
  )
}
