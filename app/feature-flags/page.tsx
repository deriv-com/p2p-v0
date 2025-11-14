"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useFeatureFlagsStore } from "@/stores/feature-flags-store"
import type { FeatureFlag } from "@/stores/feature-flags-store"
import { getRemoteConfig } from "@/services/api/api-remote-config"
import { useUserDataStore } from "@/stores/user-data-store"
import { P2PAccessRemoved } from "@/components/p2p-access-removed"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function FeatureFlagsPage() {
  const { flags, isLoading, error, setFlags, toggleFlag, setLoading, setError } = useFeatureFlagsStore()
  const { userData } = useUserDataStore()
  const { toast } = useToast()
  const isDisabled = userData?.status === "disabled"
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchFeatureFlags()
  }, [])

  const fetchFeatureFlags = async () => {
    setLoading(true)
    setError(null)

    try {
      const config = await getRemoteConfig()

      // Convert config object to FeatureFlag array
      const flagsArray: FeatureFlag[] = Object.entries(config).map(([name, enabled]) => ({
        name,
        enabled: Boolean(enabled),
        description: getFlagDescription(name),
      }))

      setFlags(flagsArray)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load feature flags"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getFlagDescription = (flagName: string): string => {
    const descriptions: Record<string, string> = {
      ory: "Enable Ory authentication system",
      // Add more descriptions as needed
    }
    return descriptions[flagName] || "No description available"
  }

  const handleToggle = async (flagName: string) => {
    toggleFlag(flagName)

    toast({
      title: "Feature Flag Updated",
      description: `${flagName} has been toggled`,
    })

    // Note: In a real implementation, you would call an API to persist the change
    // await updateFeatureFlag(flagName, newValue)
  }

  const handleRefresh = () => {
    fetchFeatureFlags()
    toast({
      title: "Refreshed",
      description: "Feature flags have been reloaded",
    })
  }

  const filteredFlags = flags.filter((flag) => flag.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isDisabled) {
    return (
      <div className="flex flex-col h-screen overflow-hidden px-3">
        <P2PAccessRemoved />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white px-3">
      <div className="flex-none container mx-auto">
        <div className="w-[calc(100%+24px)] md:w-full h-[80px] bg-slate-1200 p-6 rounded-b-3xl md:rounded-3xl text-white text-xl font-bold -m-3 mb-4 md:mx-0 md:mt-0">
          Feature Flags
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 my-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search feature flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button onClick={handleRefresh} size="sm" variant="outline" className="font-normal">
            <Image src="/icons/refresh.svg" alt="Refresh" width={16} height={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto container mx-auto p-0 pb-20 md:pb-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-5 w-32 bg-grayscale-500" />
                  <Skeleton className="h-4 w-48 bg-grayscale-500 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-12 bg-grayscale-500" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFlags.length === 0 ? (
          <div className="text-center py-12">
            <Image
              src="/icons/empty-state.svg"
              alt="No flags"
              width={120}
              height={120}
              className="mx-auto mb-4 opacity-50"
            />
            <p className="text-slate-500 text-lg font-medium">No feature flags found</p>
            {searchQuery && (
              <p className="text-slate-400 text-sm mt-2">Try adjusting your search or refresh the list</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlags.map((flag) => (
              <Card key={flag.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">{flag.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">{flag.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          flag.enabled ? "bg-completed-icon/10 text-completed-icon" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </span>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggle(flag.name)}
                        className="data-[state=checked]:bg-completed-icon"
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
