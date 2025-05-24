"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, TrendingUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface OrderBookEntry {
  price: number
  amount: number
  total: number
  count?: number
}

interface OrderBookProps {
  pair: string
}

/**
 * EnhancedOrderBook - Minimalistic order book component
 *
 * Features:
 * - Real-time order book updates
 * - Customizable precision and grouping
 * - Visual depth representation with background bars
 * - Spread calculation and display
 * - Responsive design for all screen sizes
 * - Dark/light mode support with proper contrast
 * - Click-to-fill price functionality
 *
 * @param {string} pair - Trading pair in format "BTC/USDT"
 */
export default function EnhancedOrderBook({ pair }: OrderBookProps) {
  // Order book data state
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState<{ amount: number; percentage: number }>({ amount: 0, percentage: 0 })

  // Display settings state
  const [precision, setPrecision] = useState(2)
  const [grouping, setGrouping] = useState(0.01)
  const [displaySize, setDisplaySize] = useState<"small" | "medium" | "large">("medium")

  // Number of orders to display based on display size
  const orderCount = displaySize === "small" ? 6 : displaySize === "medium" ? 8 : 12

  /**
   * Generate mock order book data
   * In a real application, this would connect to WebSocket for real-time updates
   */
  useEffect(() => {
    const generateOrderBook = () => {
      // Determine base price based on trading pair
      let basePrice = 36750
      let priceStep = 1

      if (pair.includes("ETH")) {
        basePrice = 2480
        priceStep = 0.1
      } else if (pair.includes("SOL")) {
        basePrice = 142
        priceStep = 0.01
      } else if (pair.includes("ADA")) {
        basePrice = 0.48
        priceStep = 0.0001
      } else if (pair.includes("DOT")) {
        basePrice = 7.85
        priceStep = 0.001
      }

      const mockAsks: OrderBookEntry[] = []
      const mockBids: OrderBookEntry[] = []

      // Generate asks (sell orders) - prices above current price
      for (let i = 0; i < 20; i++) {
        const price = basePrice + (i + 1) * (grouping || priceStep) + Math.random() * (grouping || priceStep)
        const amount = 0.01 + Math.random() * 2
        const count = Math.floor(1 + Math.random() * 10)
        mockAsks.push({
          price,
          amount,
          total: price * amount,
          count,
        })
      }

      // Generate bids (buy orders) - prices below current price
      for (let i = 0; i < 20; i++) {
        const price = basePrice - (i + 1) * (grouping || priceStep) - Math.random() * (grouping || priceStep)
        const amount = 0.01 + Math.random() * 2
        const count = Math.floor(1 + Math.random() * 10)
        mockBids.push({
          price,
          amount,
          total: price * amount,
          count,
        })
      }

      // Sort orders properly
      mockAsks.sort((a, b) => a.price - b.price) // Ascending for asks
      mockBids.sort((a, b) => b.price - a.price) // Descending for bids

      // Calculate cumulative totals for depth visualization
      let cumulativeAskAmount = 0
      mockAsks.forEach((ask) => {
        cumulativeAskAmount += ask.amount
        ask.total = cumulativeAskAmount
      })

      let cumulativeBidAmount = 0
      mockBids.forEach((bid) => {
        cumulativeBidAmount += bid.amount
        bid.total = cumulativeBidAmount
      })

      // Calculate spread between best bid and ask
      if (mockAsks.length > 0 && mockBids.length > 0) {
        const lowestAsk = mockAsks[0].price
        const highestBid = mockBids[0].price
        const spreadAmount = lowestAsk - highestBid
        const spreadPercentage = (spreadAmount / lowestAsk) * 100

        setSpread({
          amount: spreadAmount,
          percentage: spreadPercentage,
        })
      }

      setAsks(mockAsks)
      setBids(mockBids)
    }

    // Initial generation
    generateOrderBook()

    // Update order book every 2 seconds to simulate real-time data
    const interval = setInterval(generateOrderBook, 2000)
    return () => clearInterval(interval)
  }, [pair, grouping])

  // Calculate the maximum total for depth bar visualization
  const maxTotal = Math.max(
    ...asks.slice(0, orderCount).map((order) => order.total),
    ...bids.slice(0, orderCount).map((order) => order.total),
  )

  // Format price based on precision setting
  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(Math.max(precision, 4))
    return price.toFixed(precision)
  }

  // Format amount with appropriate decimal places
  const formatAmount = (amount: number) => {
    if (amount < 0.01) return amount.toFixed(8)
    if (amount < 1) return amount.toFixed(6)
    return amount.toFixed(4)
  }

  // Handle price click to fill order form (would emit event in real app)
  const handlePriceClick = (price: number) => {
    console.log(`Price clicked: ${price}`)
    // In a real app, this would emit an event or call a callback
    // to fill the order form with the selected price
  }

  // Available precision options
  const precisionOptions = [
    { value: 0, label: "1" },
    { value: 1, label: "0.1" },
    { value: 2, label: "0.01" },
    { value: 3, label: "0.001" },
    { value: 4, label: "0.0001" },
  ]

  // Get grouping options based on the trading pair
  const getGroupingOptions = () => {
    if (pair.includes("BTC") && !pair.includes("/BTC")) {
      return [
        { value: 0.01, label: "0.01" },
        { value: 0.1, label: "0.1" },
        { value: 1, label: "1" },
        { value: 5, label: "5" },
        { value: 10, label: "10" },
      ]
    }

    if (pair.includes("ETH")) {
      return [
        { value: 0.01, label: "0.01" },
        { value: 0.1, label: "0.1" },
        { value: 1, label: "1" },
        { value: 5, label: "5" },
      ]
    }

    // For lower value pairs
    return [
      { value: 0.0001, label: "0.0001" },
      { value: 0.001, label: "0.001" },
      { value: 0.01, label: "0.01" },
      { value: 0.1, label: "0.1" },
    ]
  }

  // Get the current market price (best bid)
  const currentPrice = bids.length > 0 ? bids[0].price : 0

  return (
    <Card className="h-full flex flex-col">
      {/* Header with title, spread info, and settings */}
      <CardHeader className="py-2 px-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Order Book</h3>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {spread.amount.toFixed(precision)}
            </Badge>
          </div>

          {/* Settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Precision settings */}
              <div className="px-2 py-1.5 border-b">
                <div className="text-xs font-medium mb-1.5">Price Precision</div>
                <div className="flex gap-1 flex-wrap">
                  {precisionOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={precision === option.value ? "default" : "outline"}
                      className="h-6 text-xs px-2"
                      onClick={() => setPrecision(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grouping settings */}
              <div className="px-2 py-1.5 border-b">
                <div className="text-xs font-medium mb-1.5">Price Grouping</div>
                <div className="flex gap-1 flex-wrap">
                  {getGroupingOptions().map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={grouping === option.value ? "default" : "outline"}
                      className="h-6 text-xs px-2"
                      onClick={() => setGrouping(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Display size settings */}
              <div className="px-2 py-1.5">
                <div className="text-xs font-medium mb-1.5">Display Size</div>
                <div className="flex gap-1">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <Button
                      key={size}
                      size="sm"
                      variant={displaySize === size ? "default" : "outline"}
                      className="h-6 text-xs px-2 capitalize"
                      onClick={() => setDisplaySize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Order book content */}
      <div className="flex-1 overflow-hidden">
        <div className="px-3 h-full flex flex-col">
          {/* Column headers */}
          <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground mb-1 py-1 border-b">
            <div>Price</div>
            <div className="text-right">Size</div>
            <div className="text-right">Total</div>
          </div>

          {/* Asks section (sell orders) */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Asks list - reversed to show highest prices at top */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-0.5">
                  {asks
                    .slice(0, orderCount)
                    .reverse()
                    .map((order, index) => (
                      <div
                        key={`ask-${index}`}
                        className="relative group cursor-pointer hover:bg-red-500/5 transition-colors"
                        onClick={() => handlePriceClick(order.price)}
                      >
                        {/* Depth visualization bar */}
                        <div
                          className="absolute right-0 top-0 h-full bg-red-500/10 transition-all duration-300"
                          style={{ width: `${Math.min((order.total / maxTotal) * 100, 100)}%` }}
                        />

                        {/* Order data */}
                        <div className="grid grid-cols-3 text-xs relative z-10 py-0.5 px-1">
                          <div className="text-red-500 font-mono tabular-nums">{formatPrice(order.price)}</div>
                          <div className="text-right font-mono tabular-nums">{formatAmount(order.amount)}</div>
                          <div className="text-right font-mono tabular-nums text-muted-foreground">
                            {formatAmount(order.total)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Current price indicator */}
              <div className="py-2 text-center border-y border-border my-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-bold font-mono">{formatPrice(currentPrice)}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-xs text-muted-foreground">Spread: {spread.percentage.toFixed(3)}%</div>
              </div>

              {/* Bids list */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-0.5">
                  {bids.slice(0, orderCount).map((order, index) => (
                    <div
                      key={`bid-${index}`}
                      className="relative group cursor-pointer hover:bg-green-500/5 transition-colors"
                      onClick={() => handlePriceClick(order.price)}
                    >
                      {/* Depth visualization bar */}
                      <div
                        className="absolute right-0 top-0 h-full bg-green-500/10 transition-all duration-300"
                        style={{ width: `${Math.min((order.total / maxTotal) * 100, 100)}%` }}
                      />

                      {/* Order data */}
                      <div className="grid grid-cols-3 text-xs relative z-10 py-0.5 px-1">
                        <div className="text-green-500 font-mono tabular-nums">{formatPrice(order.price)}</div>
                        <div className="text-right font-mono tabular-nums">{formatAmount(order.amount)}</div>
                        <div className="text-right font-mono tabular-nums text-muted-foreground">
                          {formatAmount(order.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
