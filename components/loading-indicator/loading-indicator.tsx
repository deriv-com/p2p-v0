"use client"

export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="w-2 h-6 bg-primary rounded-full animate-wave-1" />
      <div className="w-2 h-6 bg-primary rounded-full animate-wave-2" />
      <div className="w-2 h-8 bg-primary rounded-full animate-wave-3" />
      <div className="w-2 h-6 bg-primary rounded-full animate-wave-4" />
      <div className="w-2 h-6 bg-primary rounded-full animate-wave-5" />
    </div>
  )
}
