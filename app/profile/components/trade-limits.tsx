interface TradeLimitsProps {
  buyLimit: {
    current: number
    max: number
  }
  sellLimit: {
    current: number
    max: number
  }
  userData?: any
}

export default function TradeLimits({
  buyLimit,
  sellLimit,
  userData,
}: TradeLimitsProps) {
  const buyMax = userData?.daily_limits?.buy ?? buyLimit?.max
  const buyRemaining = userData?.daily_limits_remaining?.buy ?? buyLimit?.current
  const sellMax = userData?.daily_limits?.sell ?? sellLimit?.max
  const sellRemaining = userData?.daily_limits_remaining?.sell ?? sellLimit?.current
  const buyPercentage = (buyRemaining / buyMax) * 100
  const sellPercentage = (sellRemaining / sellMax) * 100

  return (
      <div className="border rounded-lg p-4">
        <h3 className="text-base font-normal mb-3 leading-6 tracking-normal">Daily trade limit</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-buy font-bold text-sm leading-5 tracking-normal">Buy</span>
              <span className="text-sm font-normal leading-5 tracking-normal">
                {buyRemaining} / {buyMax} USD
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full" style={{ width: `${buyPercentage}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sell font-bold text-sm leading-5 tracking-normal">Sell</span>
              <span className="text-sm font-normal leading-5 tracking-normal">
                {sellRemaining} / {sellMax} USD
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full" style={{ width: `${sellPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>
  
  )
}
