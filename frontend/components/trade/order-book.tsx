"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface Order {
  price: number
  amount: number
  total: number
}

interface OrderBookProps {
  pair: string
}

export default function OrderBook({ pair }: OrderBookProps) {
  const [asks, setAsks] = useState<Order[]>([])
  const [bids, setBids] = useState<Order[]>([])
  const [spread, setSpread] = useState<{ amount: number; percentage: number }>({ amount: 0, percentage: 0 })

  // Simulate fetching order book data
  useEffect(() => {
    // In a real app, you would connect to a WebSocket here
    const mockOrderBook = () => {
      const basePrice = 36750
      const mockAsks: Order[] = []
      const mockBids: Order[] = []

      // Generate mock asks (sell orders) - higher than base price
      for (let i = 0; i < 10; i++) {
        const price = basePrice + i * 5 + Math.random() * 2
        const amount = 0.1 + Math.random() * 2
        mockAsks.push({
          price,
          amount,
          total: price * amount,
        })
      }

      // Generate mock bids (buy orders) - lower than base price
      for (let i = 0; i < 10; i++) {
        const price = basePrice - i * 5 - Math.random() * 2
        const amount = 0.1 + Math.random() * 2
        mockBids.push({
          price,
          amount,
          total: price * amount,
        })
      }

      // Sort asks ascending by price
      mockAsks.sort((a, b) => a.price - b.price)

      // Sort bids descending by price
      mockBids.sort((a, b) => b.price - a.price)

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

    mockOrderBook()

    // Simulate real-time updates
    const interval = setInterval(() => {
      mockOrderBook()
    }, 5000)

    return () => clearInterval(interval)
  }, [pair])

  // Calculate the maximum total for visualization
  const maxTotal = Math.max(...asks.map((order) => order.total), ...bids.map((order) => order.total))

  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground mb-2">
          Spread: {spread.amount.toFixed(2)} ({spread.percentage.toFixed(2)}%)
        </div>

        {/* Asks (Sell Orders) */}
        <div className="mb-2">
          <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground mb-1">
            <div>Price (USDT)</div>
            <div className="text-right">Amount (BTC)</div>
            <div className="text-right">Total (USDT)</div>
          </div>

          <div className="space-y-1">
            {asks.map((order, index) => (
              <div key={`ask-${index}`} className="relative">
                <div
                  className="absolute right-0 top-0 h-full bg-red-500/10"
                  style={{ width: `${(order.total / maxTotal) * 100}%` }}
                />
                <div className="grid grid-cols-3 text-xs relative z-10">
                  <div className="text-red-500">{order.price.toFixed(2)}</div>
                  <div className="text-right">{order.amount.toFixed(6)}</div>
                  <div className="text-right">{order.total.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price Indicator */}
        <div className="py-2 text-center font-bold border-y border-border">
          {bids.length > 0 ? bids[0].price.toFixed(2) : "Loading..."}
        </div>

        {/* Bids (Buy Orders) */}
        <div className="mt-2">
          <div className="space-y-1">
            {bids.map((order, index) => (
              <div key={`bid-${index}`} className="relative">
                <div
                  className="absolute right-0 top-0 h-full bg-green-500/10"
                  style={{ width: `${(order.total / maxTotal) * 100}%` }}
                />
                <div className="grid grid-cols-3 text-xs relative z-10">
                  <div className="text-green-500">{order.price.toFixed(2)}</div>
                  <div className="text-right">{order.amount.toFixed(6)}</div>
                  <div className="text-right">{order.total.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
