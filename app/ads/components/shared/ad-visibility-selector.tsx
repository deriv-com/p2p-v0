"use client"

import { useTranslations } from "@/lib/i18n/use-translations"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import ClosedGroupTab from "@/app/profile/components/closed-group"
import { useState, useEffect } from "react"
import { getFavouriteUsers } from "@/services/api/api-profile"

interface ClosedGroupMember {
  user_id: number
  nickname: string
  is_group_member: boolean
}

interface AdVisibilitySelectorProps {
  value: string
  onValueChange: (value: string) => void
  onEditClosedGroup?: () => void
}

export default function AdVisibilitySelector({ value, onValueChange, onEditClosedGroup }: AdVisibilitySelectorProps) {
  const { t } = useTranslations()
  const { showAlert, hideAlert } = useAlertDialog()
  const [closedGroupMembers, setClosedGroupMembers] = useState<ClosedGroupMember[]>([])
  const [isCheckingMembers, setIsCheckingMembers] = useState(false)

  const hasClosedGroupMembers = closedGroupMembers.some((member) => member.is_group_member)

  const fetchClosedGroupMembers = async () => {
    try {
      setIsCheckingMembers(true)
      const data = await getFavouriteUsers()
      setClosedGroupMembers(data)
      return data
    } catch (err) {
      console.error("Failed to fetch closed group members:", err)
      setClosedGroupMembers([])
      return []
    } finally {
      setIsCheckingMembers(false)
    }
  }

  const handleEditListClick = () => {
    showAlert({
      title: "Closed group",
      content: <ClosedGroupTab isInAlert={true} />,
      confirmText: "Done",
      cancelText: undefined,
      type: "default",
      onConfirm: hideAlert,
    })
    onEditClosedGroup?.()
  }

  const handleEveryoneChange = () => {
    if (value !== "everyone") {
      hideAlert()
      onValueChange("everyone")
    }
  }

  const handleClosedGroupChange = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (value === "closed-group") {
      // Already selected, just open the editor
      handleEditListClick()
      return
    }

    // First, update the selection
    onValueChange("closed-group")

    // Then check if there are any members
    let members = closedGroupMembers
    if (members.length === 0) {
      // First time checking, fetch the members
      members = await fetchClosedGroupMembers()
    }

    // Check if there are any active members
    const hasMembers = members.some((member) => member.is_group_member)

    if (!hasMembers) {
      // No members in the closed group, show alert immediately
      showAlert({
        title: "Closed group",
        content: <ClosedGroupTab isInAlert={true} />,
        confirmText: "Done",
        cancelText: undefined,
        type: "default",
        onConfirm: hideAlert,
      })
    }
  }

  return (
    <RadioGroup value={value} onValueChange={onValueChange}>
      <Label
        htmlFor="everyone"
        className={`font-normal flex items-center justify-between p-4 gap-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${value === "everyone"
          ? "border-black"
          : "border-grayscale-500"}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleEveryoneChange()
        }}
      >
        <Image src="/icons/global.svg" alt="Everyone" width={32} height={32} />
        <div className="text-left flex-1">
          <div className="text-base mb-1 text-slate-1200">Everyone</div>
          <div className="text-xs text-grayscale-text-muted">
            Your ad will be visible to everyone on the marketplace.
          </div>
        </div>
        <RadioGroupItem value="everyone" id="everyone" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>

      <Label
        htmlFor="closed-group"
        className={`font-normal flex items-center justify-between p-4 gap-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${value === "closed-group"
          ? "border-black"
          : "border-grayscale-500"
          }`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleClosedGroupChange(e)
        }}
      >
        <Image src="/icons/closed-group.svg" alt="Closed Group" width={32} height={32} />
        <div className="text-left flex-1">
          <div className="text-base text-slate-1200 mb-1">Closed group</div>
          <div className="text-xs text-grayscale-text-muted">
            Your ad will be visible only to users in your close group list.{" "}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleEditListClick()
              }}
              className="font-normal p-0 h-auto text-xs text-grayscale-text-muted underline hover:opacity-100 hover:bg-transparent"
            >
              Edit list
            </Button>
          </div>
        </div>
        <RadioGroupItem value="closed-group" id="closed-group" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>
    </RadioGroup>
  )
}
