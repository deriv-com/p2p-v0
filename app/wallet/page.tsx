import WalletBalance from "./components/wallet-balance"
import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"

export default function WalletPage() {
  const isMobile = useIsMobile()
  return (
    <>
    {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}
    <div className="min-h-screen bg-background p-[24px]">
      <div className="container mx-auto px-4 py-6">
        <WalletBalance />
      </div>
    </div>
    </>
  )
}
