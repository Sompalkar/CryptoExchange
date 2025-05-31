"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiRequest, connectWebSocket } from "@/lib/api"
import type { OrderBookEntry, OrderBook } from "@/types/api"

interface OrderBookProps {
  pair: string
  onDataUpdate?: (data: OrderBook) => void
}

/**
 * Enhanced Order Book with improved layout and API integration
 */
export default function EnhancedOrderBook({ pair, onDataUpdate }: OrderBookProps) {
  // Order book data state
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState<{ amount: number; percentage: number }>({ amount: 0, percentage: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null)

  // Display settings
  const [precision, setPrecision] = useState(2)
  const [grouping, setGrouping] = useState(0.01)
  const [displaySize, setDisplaySize] = useState<"small" | "medium" | "large">("medium")

  // Number of orders to display based on display size
  const orderCount = displaySize === "small" ? 8 : displaySize === "medium" ? 12 : 16

  // Fetch order book data from API
  const fetchOrderBook = async () => {
    setLoading(true)
    setError(null)
    try {
      const formattedPair = pair.replace("/", "")
      const data: OrderBook = await apiRequest(`/api/markets/${formattedPair}/orderbook`)

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

      // Notify parent component of data update for chart flicker effect
      if (onDataUpdate) {
        onDataUpdate({
          asks: processedAsks,
          bids: processedBids,
          timestamp: new Date().toISOString(),
        })
      }
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
  const processOrderBookData = (data: OrderBookEntry[], isAsks: boolean) => {
    if (!data || !Array.isArray(data)) return []

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
    for (let i = 0; i < 25; i++) {
      const price = basePrice + (i + 1) * grouping + Math.random() * grouping
      const amount = 0.01 + Math.random() * 3
      const count = Math.floor(1 + Math.random() * 15)
      mockAsks.push({
        price,
        amount,
        total: price * amount,
        count,
      })
    }

    // Generate bids (buy orders)
    for (let i = 0; i < 25; i++) {
      const price = basePrice - (i + 1) * grouping - Math.random() * grouping
      const amount = 0.01 + Math.random() * 3
      const count = Math.floor(1 + Math.random() * 15)
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

    // Notify parent component of data update for chart flicker effect
    if (onDataUpdate) {
      onDataUpdate({
        asks: mockAsks,
        bids: mockBids,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const formattedPair = pair.replace("/", "")

    wsRef.current = connectWebSocket([`orderbook.${formattedPair}`], (data) => {
      if (data.channel === `orderbook.${formattedPair}` && data.data) {
        // Process the order book data
        const processedAsks = processOrderBookData(data.data.asks, true)
        const processedBids = processOrderBookData(data.data.bids, false)

        setAsks(processedAsks)
        setBids(processedBids)
        setLastUpdateTime(new Date())

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

        // Notify parent component
        if (onDataUpdate) {
          onDataUpdate({
            asks: processedAsks,
            bids: processedBids,
            timestamp: data.data.timestamp || new Date().toISOString(),
          })
        }
      }
    })

    // Initial data fetch
    fetchOrderBook()

    // Set up periodic updates as fallback if WebSocket fails
    const interval = setInterval(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        fetchOrderBook()
      }
    }, 5000)

    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [pair, grouping])

  // Calculate the maximum total for visualization
  const maxTotal =
    Math.max(
      ...asks.slice(0, orderCount).map((order) => order.total || 0),
      ...bids.slice(0, orderCount).map((order) => order.total || 0),
    ) || 1

  // Format price and amount based on precision
  const formatPrice = (price: number) => price.toFixed(precision)
  const formatAmount = (amount: number) => amount.toFixed(4)

  // Available precision options
  const precisionOptions = [
    { value: 0, label: "0" },
    { value: 1, label: "0.0" },
    { value: 2, label: "0.00" },
    { value: 3, label: "0.000" },
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 px-3 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Order Book</h3>
          <Badge variant="outline" className="text-xs px-2 h-5">
            {spread.amount.toFixed(precision)} ({spread.percentage.toFixed(2)}%)
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchOrderBook} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {/* Precision selector */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium mb-2">Precision</div>
                <div className="flex gap-1">
                  {precisionOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={precision === option.value ? "default" : "outline"}
                      className="h-6 text-xs px-2 min-w-[32px]"
                      onClick={() => setPrecision(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Display size selector */}
              <div className="px-3 py-2 border-t">
                <div className="text-sm font-medium mb-2">Display Size</div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={displaySize === "small" ? "default" : "outline"}
                    className="h-6 text-xs px-2"
                    onClick={() => setDisplaySize("small")}
                  >
                    Small
                  </Button>
                  <Button
                    size="sm"
                    variant={displaySize === "medium" ? "default" : "outline"}
                    className="h-6 text-xs px-2"
                    onClick={() => setDisplaySize("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={displaySize === "large" ? "default" : "outline"}
                    className="h-6 text-xs px-2"
                    onClick={() => setDisplaySize("large")}
                  >
                    Large
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Order book content */}
      <div className="flex-1 overflow-hidden flex flex-col px-3 pb-2">
        {/* Column headers */}
        <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1 px-1 font-medium">
          <div>Price</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) - Displayed in reverse order (highest to lowest) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin mb-1">
          <div className="space-y-[1px]">
            {asks
              .slice(0, orderCount)
              .reverse()
              .map((order, index) => (
                <div key={`ask-${index}`} className="relative group hover:bg-red-500/5 transition-colors">
                  <div
                    className="absolute right-0 top-0 h-full bg-red-500/8 transition-all duration-300"
                    style={{ width: `${((order.total || 0) / maxTotal) * 100}%` }}
                  />
                  <div className="grid grid-cols-3 text-xs relative z-10 px-1 py-1 cursor-pointer">
                    <div className="text-red-500 font-medium">{formatPrice(order.price)}</div>
                    <div className="text-right">{formatAmount(order.amount)}</div>
                    <div className="text-right text-muted-foreground">{formatAmount(order.total || 0)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Current Price Indicator */}
        <div className="py-2 text-center font-bold border-y border-border text-sm bg-muted/30">
          {bids.length > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <span>{formatPrice(bids[0].price)}</span>
              <Badge variant="outline" className="text-xs">
                Spread: {spread.amount.toFixed(precision)}
              </Badge>
            </div>
          ) : (
            "Loading..."
          )}
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin mt-1">
          <div className="space-y-[1px]">
            {bids.slice(0, orderCount).map((order, index) => (
              <div key={`bid-${index}`} className="relative group hover:bg-green-500/5 transition-colors">
                <div
                  className="absolute right-0 top-0 h-full bg-green-500/8 transition-all duration-300"
                  style={{ width: `${((order.total || 0) / maxTotal) * 100}%` }}
                />
                <div className="grid grid-cols-3 text-xs relative z-10 px-1 py-1 cursor-pointer">
                  <div className="text-green-500 font-medium">{formatPrice(order.price)}</div>
                  <div className="text-right">{formatAmount(order.amount)}</div>
                  <div className="text-right text-muted-foreground">{formatAmount(order.total || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
