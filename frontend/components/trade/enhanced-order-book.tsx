"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchWithAuth } from "@/lib/auth"

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
 */
export default function EnhancedOrderBook({ pair }: OrderBookProps) {
  // Order book data state
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState<{ amount: number; percentage: number }>({ amount: 0, percentage: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const tickerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Display settings
  const [precision, setPrecision] = useState(2)
  const [grouping, setGrouping] = useState(0.01)
  const [displaySize, setDisplaySize] = useState<"small" | "medium">("small")

  // Number of orders to display based on display size
  const orderCount = displaySize === "small" ? 8 : 12

  // Fetch order book data from API
  const fetchOrderBook = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchWithAuth(`/api/markets/${pair.replace("/", "")}/orderbook`)

      if (!response.ok) {
        throw new Error("Failed to fetch order book data")
      }

      const data = await response.json()

      // Process and group the data based on grouping setting
      const processedAsks = processOrderBookData(data.asks, true)
      const processedBids = processOrderBookData(data.bids, false)

      setAsks(processedAsks)
      setBids(processedBids)

      // Calculate spread
      if (processedAsks.length > 0 && processedBids.length > 0) {
        const lowestAsk = processedAsks[0].price
        const highestBid = processedBids[0].price
        const spreadAmount = lowestAsk - highestBid
        const spreadPercentage = (spreadAmount / lowestAsk) * 100

        setSpread({
          amount: spreadAmount,
          percentage: spreadPercentage,
        })
      }

      setLastUpdateTime(new Date())
      startTickerAnimation(processedAsks, processedBids)
    } catch (err) {
      console.error("Error fetching order book:", err)
      setError("Failed to load order book data")
      // Use demo data as fallback
      generateDemoOrderBook()
    } finally {
      setLoading(false)
    }
  }

  // Process and group order book data
  const processOrderBookData = (data: any[], isAsks: boolean) => {
    // Group orders by price based on grouping setting
    const groupedOrders: Record<string, OrderBookEntry> = {}

    data.forEach((order) => {
      const price = order.price
      const roundedPrice = Math.floor(price / grouping) * grouping
      const key = roundedPrice.toString()

      if (!groupedOrders[key]) {
        groupedOrders[key] = {
          price: roundedPrice,
          amount: 0,
          total: 0,
          count: 0,
        }
      }

      groupedOrders[key].amount += order.amount
      groupedOrders[key].count = (groupedOrders[key].count || 0) + 1
    })

    // Convert to array and sort
    let result = Object.values(groupedOrders)
    result = isAsks ? result.sort((a, b) => a.price - b.price) : result.sort((a, b) => b.price - a.price)

    // Calculate cumulative totals
    let cumulativeAmount = 0
    result.forEach((order) => {
      cumulativeAmount += order.amount
      order.total = cumulativeAmount
    })

    return result
  }

  // Start ticker animation for 1-minute interval
  const startTickerAnimation = (currentAsks: OrderBookEntry[], currentBids: OrderBookEntry[]) => {
    // Clear any existing interval
    if (tickerIntervalRef.current) {
      clearInterval(tickerIntervalRef.current)
    }

    // Create copies of the current data
    const initialAsks = [...currentAsks]
    const initialBids = [...currentBids]

    // Target data (slightly modified from initial)
    const targetAsks = initialAsks.map((ask) => ({
      ...ask,
      amount: ask.amount * (0.9 + Math.random() * 0.2), // Random variation ±10%
    }))

    const targetBids = initialBids.map((bid) => ({
      ...bid,
      amount: bid.amount * (0.9 + Math.random() * 0.2), // Random variation ±10%
    }))

    // Recalculate totals for target data
    let cumulativeAskAmount = 0
    targetAsks.forEach((ask) => {
      cumulativeAskAmount += ask.amount
      ask.total = cumulativeAskAmount
    })

    let cumulativeBidAmount = 0
    targetBids.forEach((bid) => {
      cumulativeBidAmount += bid.amount
      bid.total = cumulativeBidAmount
    })

    // Animation duration: 59 seconds
    const duration = 59000
    const startTime = Date.now()

    // Update at 30fps
    tickerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime

      // If animation is complete, stop the interval
      if (elapsed >= duration) {
        setAsks(targetAsks)
        setBids(targetBids)
        clearInterval(tickerIntervalRef.current!)
        return
      }

      // Calculate progress (0 to 1)
      const progress = elapsed / duration

      // Interpolate between initial and target values
      const currentAsks = initialAsks.map((ask, index) => {
        const targetAsk = targetAsks[index]
        return {
          ...ask,
          amount: ask.amount + (targetAsk.amount - ask.amount) * progress,
          total: ask.total + (targetAsk.total - ask.total) * progress,
        }
      })

      const currentBids = initialBids.map((bid, index) => {
        const targetBid = targetBids[index]
        return {
          ...bid,
          amount: bid.amount + (targetBid.amount - bid.amount) * progress,
          total: bid.total + (targetBid.total - bid.total) * progress,
        }
      })

      setAsks(currentAsks)
      setBids(currentBids)
    }, 33) // ~30fps
  }

  // Generate demo order book data
  const generateDemoOrderBook = () => {
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
    setLastUpdateTime(new Date())
    startTickerAnimation(mockAsks, mockBids)
  }

  // Initial data load and periodic updates
  useEffect(() => {
    fetchOrderBook()

    // Update order book every minute
    const interval = setInterval(fetchOrderBook, 60000)
    return () => {
      clearInterval(interval)
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current)
      }
    }
  }, [pair, grouping])

  // Calculate the maximum total for visualization
  const maxTotal =
    Math.max(
      ...asks.slice(0, orderCount).map((order) => order.total),
      ...bids.slice(0, orderCount).map((order) => order.total),
    ) || 1

  // Format price and amount based on precision
  const formatPrice = (price: number) => price.toFixed(precision)
  const formatAmount = (amount: number) => amount.toFixed(4)

  // Available precision options
  const precisionOptions = [
    { value: 0, label: "0" },
    { value: 1, label: "0.0" },
    { value: 2, label: "0.00" },
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-1 px-2 flex flex-row justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-xs font-medium">Order Book</h3>
          <Badge variant="outline" className="text-[10px] px-1 h-4">
            {spread.amount.toFixed(precision)} ({spread.percentage.toFixed(2)}%)
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchOrderBook} disabled={loading}>
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              {/* Precision selector */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium mb-1">Precision</div>
                <div className="flex gap-1">
                  {precisionOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={precision === option.value ? "default" : "outline"}
                      className="h-5 text-[10px] px-1 min-w-[24px]"
                      onClick={() => setPrecision(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Display size selector */}
              <div className="px-2 py-1 border-t">
                <div className="text-xs font-medium mb-1">Display</div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={displaySize === "small" ? "default" : "outline"}
                    className="h-5 text-[10px] px-1"
                    onClick={() => setDisplaySize("small")}
                  >
                    Small
                  </Button>
                  <Button
                    size="sm"
                    variant={displaySize === "medium" ? "default" : "outline"}
                    className="h-5 text-[10px] px-1"
                    onClick={() => setDisplaySize("medium")}
                  >
                    Medium
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Order book content */}
      <div className="flex-1 overflow-hidden flex flex-col px-1 pb-1">
        {/* Column headers */}
        <div className="grid grid-cols-3 text-[10px] text-muted-foreground mb-0.5 px-1">
          <div>Price</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) - Displayed in reverse order (highest to lowest) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin mb-0.5">
          <div className="space-y-[1px]">
            {asks
              .slice(0, orderCount)
              .reverse()
              .map((order, index) => (
                <div key={`ask-${index}`} className="relative">
                  <div
                    className="absolute right-0 top-0 h-full bg-red-500/10"
                    style={{ width: `${(order.total / maxTotal) * 100}%` }}
                  />
                  <div className="grid grid-cols-3 text-[10px] relative z-10 px-1 py-0.5">
                    <div className="text-red-500">{formatPrice(order.price)}</div>
                    <div className="text-right">{formatAmount(order.amount)}</div>
                    <div className="text-right">{formatAmount(order.total)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Current Price Indicator */}
        <div className="py-0.5 text-center font-bold border-y border-border text-xs">
          {bids.length > 0 ? formatPrice(bids[0].price) : "Loading..."}
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin mt-0.5">
          <div className="space-y-[1px]">
            {bids.slice(0, orderCount).map((order, index) => (
              <div key={`bid-${index}`} className="relative">
                <div
                  className="absolute right-0 top-0 h-full bg-green-500/10"
                  style={{ width: `${(order.total / maxTotal) * 100}%` }}
                />
                <div className="grid grid-cols-3 text-[10px] relative z-10 px-1 py-0.5">
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

