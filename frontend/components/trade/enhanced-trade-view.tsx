"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import EnhancedTradingChart from "./enhanced-trading-chart"
import EnhancedOrderBook from "./enhanced-order-book"
import EnhancedOrderForm from "./enhanced-order-form"
import RecentTrades from "./recent-trades"
import PairSelector from "./pair-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface EnhancedTradeViewProps {
  pair: string
}

/**
 * EnhancedTradeView - Main trading interface component
 *
 * This component orchestrates the entire trading view with:
 * - Trading pair selection
 * - Real-time price updates
 * - Chart display (left side, 75% width)
 * - Order book and order form (right side, stacked vertically)
 * - Recent trades and order history tabs
 *
 * @param {string} pair - Trading pair in format "BTC/USDT"
 */
export default function EnhancedTradeView({ pair = "BTC/USDT" }: EnhancedTradeViewProps) {
  // State for the current trading pair
  const [currentPair, setCurrentPair] = useState<string>(pair)
  // State for current price and price change
  const [currentPrice, setCurrentPrice] = useState<number>(36750.0)
  const [priceChange, setPriceChange] = useState<number>(2.34)
  // State for 24h trading stats
  const [high24h, setHigh24h] = useState<number>(37500.0)
  const [low24h, setLow24h] = useState<number>(36200.0)
  const [volume24h, setVolume24h] = useState<number>(28900000000)

  // Handle pair change from the pair selector
  const handlePairChange = (newPair: string) => {
    setCurrentPair(newPair)

    // Reset price data when pair changes
    // In a real app, this would fetch new data for the selected pair
    const basePrice = newPair.includes("BTC")
      ? 36750
      : newPair.includes("ETH")
        ? 2480
        : newPair.includes("SOL")
          ? 142
          : 1000

    setCurrentPrice(basePrice)
    setPriceChange((Math.random() - 0.3) * 5) // Slightly biased toward positive
    setHigh24h(basePrice * (1 + Math.random() * 0.05))
    setLow24h(basePrice * (1 - Math.random() * 0.05))
    setVolume24h(Math.random() * 30000000000)
  }

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random price fluctuations
      const change = (Math.random() - 0.5) * (currentPrice * 0.001)
      setCurrentPrice((prev) => {
        const newPrice = Math.max(prev + change, 1)
        // Update 24h high/low if needed
        if (newPrice > high24h) setHigh24h(newPrice)
        if (newPrice < low24h) setLow24h(newPrice)
        return newPrice
      })

      // Occasionally update the price change percentage
      if (Math.random() > 0.7) {
        setPriceChange((prev) => prev + (Math.random() - 0.5) * 0.2)
      }

      // Update volume
      setVolume24h((prev) => prev + Math.random() * 100000)
    }, 3000)

    return () => clearInterval(interval)
  }, [currentPair, currentPrice, high24h, low24h])

  // Format volume for display
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  return (
    <div className="flex-1 p-2 md:p-4 space-y-2 md:space-y-4">
      {/* Price Header with Pair Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4"
      >
        <div className="flex items-center gap-4">
          {/* Pair selector component */}
          <PairSelector currentPair={currentPair} onPairChange={handlePairChange} />

          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-bold">${currentPrice.toLocaleString()}</span>
            <Badge className={`${priceChange >= 0 ? "bg-green-500" : "bg-red-500"}`}>
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* 24h Trading Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            24h High: <span className="text-foreground">${high24h.toLocaleString()}</span>
          </div>
          <div>
            24h Low: <span className="text-foreground">${low24h.toLocaleString()}</span>
          </div>
          <div>
            24h Vol: <span className="text-foreground">{formatVolume(volume24h)}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 h-[calc(100vh-200px)]">
        {/* Left Side - Chart (Takes 3 columns on lg screens = 75%) */}
        <div className="lg:col-span-3 col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <EnhancedTradingChart pair={currentPair} />
          </motion.div>
        </div>

        {/* Right Side - Order Book and Order Form (Takes 1 column on lg screens = 25%) */}
        <div className=" flex h-full  flex-col  ">
          {/* Order Book - Takes 50% of the right column height */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-1/2"
          >
            <EnhancedOrderBook pair={currentPair} />
          </motion.div>

          {/* Order Form - Takes 50% of the right column height */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="h-1/2"
          >
            <EnhancedOrderForm pair={currentPair} currentPrice={currentPrice} />
          </motion.div>
        </div>
      </div>

      {/* Bottom Section - Recent Trades and Open Orders */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="h-64 md:h-80"
      >
        <Tabs defaultValue="recent-trades" className="h-full">
          <TabsList>
            <TabsTrigger value="recent-trades">Recent Trades</TabsTrigger>
            <TabsTrigger value="open-orders">Open Orders</TabsTrigger>
            <TabsTrigger value="order-history">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="recent-trades" className="h-full mt-2 md:mt-4">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <RecentTrades pair={currentPair} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open-orders" className="h-full mt-2 md:mt-4">
            <Card className="h-full">
              <CardHeader className="py-3">
                <CardTitle>Open Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">No open orders</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="order-history" className="h-full mt-2 md:mt-4">
            <Card className="h-full">
              <CardHeader className="py-3">
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">No order history</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div> */}
    </div>
  )
}
