import Image from "next/image"

interface WalletDisplayProps {
  name: string
  amount: string
  icon: string
  isSelected?: boolean
}

export default function WalletDisplay({ name, amount, icon, isSelected = false }: WalletDisplayProps) {
  return (
    <div
      className={`p-4 px-6 flex items-center gap-4 rounded-2xl bg-grayscale-500 ${isSelected ? "border border-black" : ""}`}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={icon || "/placeholder.svg"}
          alt={name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="text-black/72 text-base font-normal">{name}</div>
        <div className="text-black/48 text-sm font-normal">{amount}</div>
      </div>
      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
        {isSelected && <div className="w-3 h-3 rounded-full bg-black"></div>}
      </div>
    </div>
  )
}
