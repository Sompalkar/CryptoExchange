
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Star, TrendingUp, TrendingDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface Market {
  id: string
  symbol: string
  baseAsset: string
  quoteAsset: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap?: number
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])

  // Mock API call
  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockMarkets: Market[] = [
          {
            id: "btc-usdt",
            symbol: "BTC/USDT",
            baseAsset: "BTC",
            quoteAsset: "USDT",
            price: 36750.0,
            change24h: 2.34,
            volume24h: 28900000000,
            high24h: 37200.5,
            low24h: 36100.25,
            marketCap: 712500000000,
          },
          {
            id: "eth-usdt",
            symbol: "ETH/USDT",
            baseAsset: "ETH",
            quoteAsset: "USDT",
            price: 2480.75,
            change24h: 1.87,
            volume24h: 15200000000,
            high24h: 2520.3,
            low24h: 2440.1,
            marketCap: 298300000000,
          },
          {
            id: "sol-usdt",
            symbol: "SOL/USDT",
            baseAsset: "SOL",
            quoteAsset: "USDT",
            price: 142.3,
            change24h: -0.92,
            volume24h: 3800000000,
            high24h: 148.75,
            low24h: 140.2,
            marketCap: 61500000000,
          },
          {
            id: "ada-usdt",
            symbol: "ADA/USDT",
            baseAsset: "ADA",
            quoteAsset: "USDT",
            price: 0.485,
            change24h: 3.21,
            volume24h: 890000000,
            high24h: 0.492,
            low24h: 0.468,
            marketCap: 17200000000,
          },
          {
            id: "dot-usdt",
            symbol: "DOT/USDT",
            baseAsset: "DOT",
            quoteAsset: "USDT",
            price: 7.85,
            change24h: -1.45,
            volume24h: 420000000,
            high24h: 8.12,
            low24h: 7.73,
            marketCap: 9800000000,
          },
        ]

        setMarkets(mockMarkets)
      } catch (error) {
        console.error("Failed to fetch markets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [])

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.baseAsset.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedCategory === "favorites") {
      return matchesSearch && favorites.includes(market.id)
    }

    return matchesSearch
  })

  const toggleFavorite = (marketId: string) => {
    setFavorites((prev) => (prev.includes(marketId) ? prev.filter((id) => id !== marketId) : [...prev, marketId]))
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Markets</h1>
            <p className="text-muted-foreground">Explore and trade cryptocurrency markets</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="futures">Futures</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Market</th>
                    <th className="text-right p-4 font-medium">Price</th>
                    <th className="text-right p-4 font-medium">24h Change</th>
                    <th className="text-right p-4 font-medium">24h Volume</th>
                    <th className="text-right p-4 font-medium">Market Cap</th>
                    <th className="text-right p-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                              <div className="space-y-2">
                                <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
                                <div className="w-12 h-3 bg-muted rounded animate-pulse"></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="w-20 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="p-4">
                            <div className="w-16 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="p-4">
                            <div className="w-20 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="p-4">
                            <div className="w-20 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                          </td>
                          <td className="p-4">
                            <div className="w-16 h-8 bg-muted rounded animate-pulse ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    : filteredMarkets.map((market) => (
                        <motion.tr
                          key={market.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleFavorite(market.id)}
                                className="text-muted-foreground hover:text-yellow-500 transition-colors"
                              >
                                <Star
                                  className={`h-4 w-4 ${favorites.includes(market.id) ? "fill-yellow-500 text-yellow-500" : ""}`}
                                />
                              </button>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {market.baseAsset.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium">{market.symbol}</div>
                                <div className="text-xs text-muted-foreground">{market.baseAsset}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium">${market.price.toLocaleString()}</td>
                          <td className="p-4 text-right">
                            <div
                              className={`flex items-center justify-end ${market.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              {market.change24h >= 0 ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              {market.change24h >= 0 ? "+" : ""}
                              {market.change24h.toFixed(2)}%
                            </div>
                          </td>
                          <td className="p-4 text-right">{formatNumber(market.volume24h)}</td>
                          <td className="p-4 text-right">{market.marketCap ? formatNumber(market.marketCap) : "-"}</td>
                          <td className="p-4 text-right">
                            <Link href={`/trade/${market.id}`}>
                              <Button size="sm" variant="gradient">
                                Trade
                              </Button>
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
