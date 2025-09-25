"use client"

import { Button } from "@/components/ui/button"

export function NovuNotifications() {
  return (
    <Button variant="ghost" size="sm" className="p-2">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v18"
        />
      </svg>
    </Button>
  )
}
