"use client"

import { memo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"
import {
  type AnnouncementKind,
  ANNOUNCEMENT_ASSET_PATHS,
  ANNOUNCEMENT_TRANSLATION_KEYS,
} from "./p2p-announcement-config"

interface P2PAnnouncementProps {
  kind: AnnouncementKind
  onDismiss: () => void
}

interface AnnouncementContentProps extends P2PAnnouncementProps {
  layout: "modal" | "sheet"
}

// Memoized so the content subtree is not recreated when the parent re-renders
// due to useIsMobile returning a new value on viewport resize.
const AnnouncementContent = memo(function AnnouncementContent({
  kind,
  onDismiss,
  layout,
}: AnnouncementContentProps) {
  const { t } = useTranslations()
  const keys = ANNOUNCEMENT_TRANSLATION_KEYS[kind]
  const imagePath = ANNOUNCEMENT_ASSET_PATHS[kind]
  const isModal = layout === "modal"

  return (
    <div className="flex flex-col">
      {/* Visual area */}
      <div
        className={
          isModal
            ? "relative w-full h-48 bg-grayscale-500 rounded-t-2xl overflow-hidden"
            : "relative w-full h-56 bg-grayscale-500 overflow-hidden"
        }
      >
        <Image
          src={imagePath}
          alt={t(keys.title)}
          fill
          className="object-contain p-6"
          priority
        />
      </div>

      {/* Content area */}
      <div className={isModal ? "px-8 pt-6 pb-4" : "px-6 pt-6 pb-4"}>
        <h2 className="text-xl font-bold text-slate-1200 mb-4">
          {t(keys.title)}
        </h2>
        <ul className="space-y-2">
          {keys.bullets.map((bulletKey, index) => (
            <li key={index} className="flex items-start gap-2 text-base text-grayscale-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-grayscale-600" />
              {t(bulletKey)}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA area */}
      <div className={`flex flex-col gap-2 ${isModal ? "px-8 pb-8 pt-2" : "px-6 pb-8 pt-2"}`}>
        <Button className="w-full" onClick={onDismiss}>
          {t(keys.primaryCta)}
        </Button>
        {"secondaryCta" in keys && (
          <Button className="w-full" variant="outline" onClick={onDismiss}>
            {t((keys as typeof ANNOUNCEMENT_TRANSLATION_KEYS.whatsComing).secondaryCta)}
          </Button>
        )}
      </div>
    </div>
  )
})

export function P2PAnnouncement({ kind, onDismiss }: P2PAnnouncementProps) {
  const { t } = useTranslations()
  const isMobile = useIsMobile()
  const keys = ANNOUNCEMENT_TRANSLATION_KEYS[kind]

  if (isMobile) {
    return (
      <Drawer open onOpenChange={(open) => { if (!open) onDismiss() }}>
        <DrawerContent className="p-0 rounded-t-2xl max-h-[90vh] overflow-y-auto">
          <DrawerTitle className="sr-only">
            {t(keys.title)}
          </DrawerTitle>
          <AnnouncementContent kind={kind} onDismiss={onDismiss} layout="sheet" />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDismiss() }}>
      <DialogContent className="p-0 max-w-md rounded-2xl overflow-hidden">
        <DialogTitle className="sr-only">
          {t(keys.title)}
        </DialogTitle>
        <AnnouncementContent kind={kind} onDismiss={onDismiss} layout="modal" />
      </DialogContent>
    </Dialog>
  )
}
