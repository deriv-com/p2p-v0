"use client"

export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-2 h-6 bg-primary rounded-full animate-wave" />
      <div className="w-2 h-6 bg-primary rounded-full animate-wave" />
      <div className="w-2 h-8 bg-primary rounded-full animate-wave" />
      <div className="w-2 h-6 bg-primary rounded-full animate-wave" />
      <div className="w-2 h-6 bg-primary rounded-full animate-wave" />
    </div>
  )
}
