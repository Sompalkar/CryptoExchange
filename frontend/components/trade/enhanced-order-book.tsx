"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
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
 * - Visual depth representation
 * - Spread calculation
 * - Works well in both dark and light modes
 *
 * @param {string} pair - Trading pair in format "BTC/USDT"
 */
export default function EnhancedOrderBook({ pair }: OrderBookProps) {
  // Order book data state
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState<{ amount: number; percentage: number }>({ amount: 0, percentage: 0 })

  // Display settings
  const [precision, setPrecision] = useState(2)
  const [grouping, setGrouping] = useState(0.01)
  const [displaySize, setDisplaySize] = useState<"small" | "medium" | "large">("medium")

  // Number of orders to display based on display size
  const orderCount = displaySize === "small" ? 6 : displaySize === "medium" ? 10 : 15

  // Generate order book data when pair changes or periodically
  useEffect(() => {
    const generateOrderBook = () => {
      // Determine base price based on trading pair
      let basePrice = 36750
      if (pair.includes("ETH")) basePrice = 2480
      else if (pair.includes("SOL")) basePrice = 142
      else if (pair.includes("ADA")) basePrice = 0.48
      else if (pair.includes("DOT")) basePrice = 7.85

      const mockAsks: OrderBookEntry[] = []
      const mockBids: OrderBookEntry[] = []

      // Generate asks (sell orders)
      for (let i = 0; i < 20; i++) {
        const price = basePrice + (i + 1) * grouping + Math.random() * grouping
        const amount = 0.01 + Math.random() * 2
        const count = Math.floor(1 + Math.random() * 10)
        mockAsks.push({
          price,
          amount,
          total: price * amount,
          count,
        })
      }

      // Generate bids (buy orders)
      for (let i = 0; i < 20; i++) {
        const price = basePrice - (i + 1) * grouping - Math.random() * grouping
        const amount = 0.01 + Math.random() * 2
        const count = Math.floor(1 + Math.random() * 10)
        mockBids.push({
          price,
          amount,
          total: price * amount,
          count,
        })
      }

      // Sort orders
      mockAsks.sort((a, b) => a.price - b.price)
      mockBids.sort((a, b) => b.price - a.price)

      // Calculate cumulative totals
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

      // Calculate spread
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

    generateOrderBook()

    // Update order book periodically
    const interval = setInterval(generateOrderBook, 2000)
    return () => clearInterval(interval)
  }, [pair, grouping])

  // Calculate the maximum total for visualization
  const maxTotal = Math.max(
    ...asks.slice(0, orderCount).map((order) => order.total),
    ...bids.slice(0, orderCount).map((order) => order.total),
  )

  // Format price and amount based on precision
  const formatPrice = (price: number) => price.toFixed(precision)
  const formatAmount = (amount: number) => amount.toFixed(6)

  // Available precision options
  const precisionOptions = [
    { value: 0, label: "0" },
    { value: 1, label: "0.0" },
    { value: 2, label: "0.00" },
    { value: 3, label: "0.000" },
    { value: 4, label: "0.0000" },
  ]

  // Available grouping options based on the pair
  const getGroupingOptions = () => {
    // For BTC and high-value pairs
    if (pair.includes("BTC/") || pair.includes("/BTC")) {
      return [
        { value: 0.0001, label: "0.0001" },
        { value: 0.001, label: "0.001" },
        { value: 0.01, label: "0.01" },
        { value: 0.1, label: "0.1" },
        { value: 1, label: "1" },
      ]
    }

    // For mid-value pairs like ETH
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 px-3 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Order Book</h3>
          <Badge variant="outline" className="text-xs">
            Spread: {spread.amount.toFixed(precision)} ({spread.percentage.toFixed(3)}%)
          </Badge>
        </div>

        {/* Order book settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Precision selector */}
            <div className="px-2 py-1.5">
              <div className="text-xs font-medium mb-1.5">Precision</div>
              <div className="flex gap-1">
                {precisionOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={precision === option.value ? "default" : "outline"}
                    className="h-6 text-xs px-1.5 min-w-[30px]"
                    onClick={() => setPrecision(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grouping selector */}
            <div className="px-2 py-1.5 border-t">
              <div className="text-xs font-medium mb-1.5">Grouping</div>
              <div className="flex flex-wrap gap-1">
                {getGroupingOptions().map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={grouping === option.value ? "default" : "outline"}
                    className="h-6 text-xs px-1.5"
                    onClick={() => setGrouping(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Display size selector */}
            <div className="px-2 py-1.5 border-t">
              <div className="text-xs font-medium mb-1.5">Display</div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={displaySize === "small" ? "default" : "outline"}
                  className="h-6 text-xs px-1.5"
                  onClick={() => setDisplaySize("small")}
                >
                  Small
                </Button>
                <Button
                  size="sm"
                  variant={displaySize === "medium" ? "default" : "outline"}
                  className="h-6 text-xs px-1.5"
                  onClick={() => setDisplaySize("medium")}
                >
                  Medium
                </Button>
                <Button
                  size="sm"
                  variant={displaySize === "large" ? "default" : "outline"}
                  className="h-6 text-xs px-1.5"
                  onClick={() => setDisplaySize("large")}
                >
                  Large
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Order book content */}
      <div className="flex-1 overflow-hidden flex flex-col px-2 pb-2">
        {/* Column headers */}
        <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1 px-1">
          <div>Price</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) - Displayed in reverse order (highest to lowest) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin mb-1">
          <div className="space-y-[2px]">
            {asks
              .slice(0, orderCount)
              .reverse()
              .map((order, index) => (
                <div key={`ask-${index}`} className="relative">
                  <div
                    className="absolute right-0 top-0 h-full bg-red-500/10"
                    style={{ width: `${(order.total / maxTotal) * 100}%` }}
                  />
                  <div className="grid grid-cols-3 text-xs relative z-10 px-1">
                    <div className="text-red-500">{formatPrice(order.price)}</div>
                    <div className="text-right">{formatAmount(order.amount)}</div>
                    <div className="text-right">{formatAmount(order.total)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Current Price Indicator */}
        <div className="py-1 text-center font-bold border-y border-border text-sm">
          {bids.length > 0 ? formatPrice(bids[0].price) : "Loading..."}
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin mt-1">
          <div className="space-y-[2px]">
            {bids.slice(0, orderCount).map((order, index) => (
              <div key={`bid-${index}`} className="relative">
                <div
                  className="absolute right-0 top-0 h-full bg-green-500/10"
                  style={{ width: `${(order.total / maxTotal) * 100}%` }}
                />
                <div className="grid grid-cols-3 text-xs relative z-10 px-1">
                  <div className="text-green-500">{formatPrice(order.price)}</div>
                  <div className="text-right">{formatAmount(order.amount)}</div>
                  <div className="text-right">{formatAmount(order.total)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
