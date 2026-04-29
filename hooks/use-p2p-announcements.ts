"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type AnnouncementKind,
  ANNOUNCEMENT_STORAGE_KEYS,
  getReleaseTag,
  getWhatsComingTag,
  isWhatsNewEnabled,
} from "@/components/p2p-announcement/p2p-announcement-config"

interface UseP2PAnnouncementsReturn {
  currentAnnouncement: AnnouncementKind | null
  dismissAnnouncement: () => void
  isReady: boolean
}

function readStoredTag(key: string): string {
  try {
    return localStorage.getItem(key) ?? ""
  } catch {
    return ""
  }
}

function writeStoredTag(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore quota/private-browsing errors
  }
}

function resolveEligible(): AnnouncementKind | null {
  const releaseTag = getReleaseTag()
  const whatsComingTag = getWhatsComingTag()

  const whatsNewEligible =
    isWhatsNewEnabled() &&
    Boolean(releaseTag) &&
    readStoredTag(ANNOUNCEMENT_STORAGE_KEYS.whatsNew) !== releaseTag

  const whatsComingEligible =
    Boolean(whatsComingTag) &&
    readStoredTag(ANNOUNCEMENT_STORAGE_KEYS.whatsComing) !== whatsComingTag

  // What's New has priority. After it is dismissed the controller re-evaluates,
  // which surfaces What's Coming if still eligible.
  if (whatsNewEligible) return "whatsNew"
  if (whatsComingEligible) return "whatsComing"
  return null
}

export function useP2PAnnouncements(): UseP2PAnnouncementsReturn {
  const [isReady, setIsReady] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<AnnouncementKind | null>(null)

  useEffect(() => {
    // Resolve entirely client-side to avoid localStorage access on server
    // and prevent hydration mismatches.
    setCurrentAnnouncement(resolveEligible())
    setIsReady(true)
  }, [])

  const dismissAnnouncement = useCallback(() => {
    if (!currentAnnouncement) return

    if (currentAnnouncement === "whatsNew") {
      writeStoredTag(ANNOUNCEMENT_STORAGE_KEYS.whatsNew, getReleaseTag())
    } else if (currentAnnouncement === "whatsComing") {
      writeStoredTag(ANNOUNCEMENT_STORAGE_KEYS.whatsComing, getWhatsComingTag())
    }

    // Re-evaluate after dismissal so What's Coming can surface when
    // What's New was the one just dismissed.
    setCurrentAnnouncement(resolveEligible())
  }, [currentAnnouncement])

  return { currentAnnouncement, dismissAnnouncement, isReady }
}
