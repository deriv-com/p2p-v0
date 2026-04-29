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

const memoryStorage = new Map<string, string>()

function getAvailableStorage(): Storage | null {
  const testKey = "p2p.announcement.storageTest"

  try {
    localStorage.setItem(testKey, "1")
    localStorage.removeItem(testKey)
    return localStorage
  } catch {
    try {
      sessionStorage.setItem(testKey, "1")
      sessionStorage.removeItem(testKey)
      return sessionStorage
    } catch {
      return null
    }
  }
}

function readStoredTag(key: string): string {
  const storage = getAvailableStorage()

  try {
    return storage?.getItem(key) ?? memoryStorage.get(key) ?? ""
  } catch {
    return memoryStorage.get(key) ?? ""
  }
}

function writeStoredTag(key: string, value: string): void {
  const storage = getAvailableStorage()

  try {
    if (storage) {
      storage.setItem(key, value)
      return
    }
  } catch {
    // Fall back to memory below for browsers that block storage writes.
  }

  memoryStorage.set(key, value)
}

export function useP2PAnnouncements(): UseP2PAnnouncementsReturn {
  const [isReady, setIsReady] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<AnnouncementKind | null>(null)
  const releaseTag = getReleaseTag()
  const whatsComingTag = getWhatsComingTag()
  const whatsNewEnabled = isWhatsNewEnabled()

  const resolveEligibleAnnouncement = useCallback((): AnnouncementKind | null => {
    const whatsNewEligible =
      whatsNewEnabled &&
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
  }, [releaseTag, whatsComingTag, whatsNewEnabled])

  useEffect(() => {
    // Resolve entirely client-side to avoid localStorage access on server
    // and prevent hydration mismatches.
    setCurrentAnnouncement(resolveEligibleAnnouncement())
    setIsReady(true)
  }, [resolveEligibleAnnouncement])

  const dismissAnnouncement = useCallback(() => {
    if (!currentAnnouncement) return

    if (currentAnnouncement === "whatsNew") {
      writeStoredTag(ANNOUNCEMENT_STORAGE_KEYS.whatsNew, releaseTag)
    } else if (currentAnnouncement === "whatsComing") {
      writeStoredTag(ANNOUNCEMENT_STORAGE_KEYS.whatsComing, whatsComingTag)
    }

    // Re-evaluate after dismissal so What's Coming can surface when
    // What's New was the one just dismissed.
    setCurrentAnnouncement(resolveEligibleAnnouncement())
  }, [currentAnnouncement, releaseTag, resolveEligibleAnnouncement, whatsComingTag])

  return { currentAnnouncement, dismissAnnouncement, isReady }
}
