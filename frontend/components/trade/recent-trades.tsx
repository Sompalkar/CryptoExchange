"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface Trade {
  id: string
  price: number
  amount: number
  total: number
  side: "buy" | "sell"
  timestamp: string
}

interface RecentTradesProps {
  pair: string
}

export default function RecentTrades({ pair }: RecentTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const basePrice = 36750

  // Simulate fetching recent trades
  useEffect(() => {
    // In a real app, you would connect to a WebSocket here
    const generateMockTrades = () => {
      const mockTrades: Trade[] = []

      // Generate initial mock trades
      for (let i = 0; i < 20; i++) {
        const side = Math.random() > 0.5 ? "buy" : "sell"
        const priceVariation = Math.random() * 20 - 10 // +/- $10
        const price = basePrice + priceVariation
        const amount = 0.001 + Math.random() * 0.5

        mockTrades.push({
          id: `trade-${Date.now()}-${i}`,
          price,
          amount,
          total: price * amount,
          side,
          timestamp: new Date(Date.now() - i * 30000).toISOString(), // 30 seconds apart
        })
      }

      // Sort by timestamp (newest first)
      mockTrades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setTrades(mockTrades)
    }

    generateMockTrades()

    // Simulate new trades coming in
    const interval = setInterval(() => {
      setTrades((prevTrades) => {
        const side = Math.random() > 0.5 ? "buy" : "sell"
        const lastPrice = prevTrades.length > 0 ? prevTrades[0].price : basePrice
        const priceVariation = Math.random() * 10 - 5 // +/- $5
        const price = lastPrice + priceVariation
        const amount = 0.001 + Math.random() * 0.5

        const newTrade = {
          id: `trade-${Date.now()}`,
          price,
          amount,
          total: price * amount,
          side,
          timestamp: new Date().toISOString(),
        }

        // Add new trade to the beginning and limit to 20 trades
        return [newTrade, ...prevTrades].slice(0, 20)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [pair])

  // Format timestamp to local time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground mb-1">
          <div>Price (USDT)</div>
          <div className="text-right">Amount (BTC)</div>
          <div className="text-right">Time</div>
        </div>

        <div className="space-y-1">
          {trades.map((trade) => (
            <div key={trade.id} className="grid grid-cols-3 text-xs">
              <div className={trade.side === "buy" ? "text-green-500" : "text-red-500"}>{trade.price.toFixed(2)}</div>
              <div className="text-right">{trade.amount.toFixed(6)}</div>
              <div className="text-right text-muted-foreground">{formatTime(trade.timestamp)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
