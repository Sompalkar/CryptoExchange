import type { Metadata } from "next"
import EnhancedTradeView from "@/components/trade/enhanced-trade-view"

interface TradePageProps {
  params: {
    pair: string
  }
}

/**
 * Generate metadata for the trading page
 * Includes SEO-friendly title and description based on the trading pair
 */
export async function generateMetadata({ params }: TradePageProps): Promise<Metadata> {
  const formattedPair = params.pair.replace("-", "/").toUpperCase()

  return {
    title: `${formattedPair} Trading | NexusX Exchange`,
    description: `Trade ${formattedPair} on NexusX - Advanced cryptocurrency trading platform with real-time charts, order book, and professional trading tools. Start trading now!`,
    keywords: `${formattedPair}, cryptocurrency trading, crypto exchange, trading platform, ${formattedPair.split("/")[0]}, ${formattedPair.split("/")[1]}`,
  }
}

/**
 * TradePage - Main trading interface page
 *
 * Features:
 * - Full-screen trading layout
 * - Responsive design for all screen sizes
 * - Real-time trading interface
 * - SEO-optimized metadata
 *
 * @param {object} params - Route parameters containing the trading pair
 */
export default function TradePage({ params }: TradePageProps) {
  // Convert URL format (btc-usdt) to display format (BTC/USDT)
  const formattedPair = params.pair.replace("-", "/").toUpperCase()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main trading interface */}
      <EnhancedTradeView pair={formattedPair} />
    </div>
  )
}
