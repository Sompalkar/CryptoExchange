import type { Metadata } from "next"
import TradeView from "@/components/trade/trade-view"

interface TradePageProps {
  params: {
    pair: string
  }
}

export async function generateMetadata({ params }: TradePageProps): Promise<Metadata> {
  const formattedPair = params.pair.replace("-", "/").toUpperCase()

  return {
    title: `${formattedPair} Trading | Exchange Platform`,
    description: `Trade ${formattedPair} on our secure cryptocurrency exchange platform.`,
  }
}

export default function TradePage({ params }: TradePageProps) {
  // Format the URL parameter (e.g., "btc-usdt" to "BTC/USDT")
  const formattedPair = params.pair.replace("-", "/").toUpperCase()

  return (
    <div className="container mx-auto py-6 px-4">
      <TradeView pair={formattedPair} />
    </div>
  )
}
