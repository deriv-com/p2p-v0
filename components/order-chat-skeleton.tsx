export default function OrderChatSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header Skeleton */}
      <div className="flex items-center p-4 border-b">
        <div className="w-10 h-10 rounded-full bg-grayscale-500 animate-pulse mr-3" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-grayscale-500 animate-pulse rounded" />
          <div className="h-3 w-20 bg-grayscale-500 animate-pulse rounded" />
        </div>
      </div>

      <div className="h-full overflow-auto">
        {/* Disclaimer Section Skeleton */}
        <div className="p-[16px] m-[16px] bg-grayscale-500 animate-pulse rounded-[16px] h-[120px]" />

        {/* Messages Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Date Header Skeleton */}
          <div className="flex justify-center my-4">
            <div className="h-6 w-32 bg-grayscale-500 animate-pulse rounded-full" />
          </div>

          {/* Message Skeleton - Received */}
          <div className="flex justify-start">
            <div className="max-w-[80%] space-y-2">
              <div className="h-16 w-64 bg-grayscale-500 animate-pulse rounded-lg" />
              <div className="h-3 w-16 bg-grayscale-500 animate-pulse rounded" />
            </div>
          </div>

          {/* Message Skeleton - Sent */}
          <div className="flex justify-end">
            <div className="max-w-[80%] space-y-2">
              <div className="h-16 w-48 bg-grayscale-500 animate-pulse rounded-lg" />
              <div className="h-3 w-16 bg-grayscale-500 animate-pulse rounded ml-auto" />
            </div>
          </div>

          {/* Message Skeleton - Received */}
          <div className="flex justify-start">
            <div className="max-w-[80%] space-y-2">
              <div className="h-20 w-56 bg-grayscale-500 animate-pulse rounded-lg" />
              <div className="h-3 w-16 bg-grayscale-500 animate-pulse rounded" />
            </div>
          </div>

          {/* Message Skeleton - Sent */}
          <div className="flex justify-end">
            <div className="max-w-[80%] space-y-2">
              <div className="h-12 w-40 bg-grayscale-500 animate-pulse rounded-lg" />
              <div className="h-3 w-16 bg-grayscale-500 animate-pulse rounded ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Section Skeleton */}
      <div className="p-4 border-t bg-slate-75">
        <div className="space-y-2">
          <div className="h-14 w-full bg-grayscale-500 animate-pulse rounded-lg" />
          <div className="flex justify-between items-center">
            <div />
            <div className="h-3 w-12 bg-grayscale-500 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
