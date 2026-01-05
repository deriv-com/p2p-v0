export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 bg-[#FF444F] rounded-full animate-wave"
            style={{
              height: i === 2 ? "32px" : i === 1 || i === 3 ? "24px" : "16px",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
