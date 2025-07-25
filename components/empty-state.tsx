import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    title?: string
    description?: string
    className?: string
}

export default function EmptyState({
    title = "No ads available",
    description,
    className,
}: EmptyStateProps) {
    const router = useRouter()

    return (
        <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
            <Image src="/icons/search-icon.png" alt="No ads found" width={56} height={56} className="opacity-60" />
            {title && <p className="text-lg text-neutral-10 mt-[24px] font-bold">{title}</p>}
            {description && <p className="text-base text-neutral-7 mb-[10px]">{description}</p>}
            <Button onClick={() => router.push("/ads/create")} className="mt-[24px]">
                + Create ad
            </Button>
        </div>
    )
}
