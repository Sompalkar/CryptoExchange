"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface PairSelectorProps {
  currentPair: string
  onPairChange: (pair: string) => void
}

/**
 * PairSelector - Trading pair selection component
 *
 * Allows users to quickly switch between different trading pairs
 * Features:
 * - Search functionality
 * - Categorized tabs (All, USDT, BTC, Favorites)
 * - Star/unstar favorites
 *
 * @param {string} currentPair - Currently selected trading pair
 * @param {function} onPairChange - Callback when pair is changed
 */
export default function PairSelector({ currentPair, onPairChange }: PairSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState<string[]>(["BTC/USDT", "ETH/USDT"])

  // Mock trading pairs data
  const tradingPairs = [
    { symbol: "BTC/USDT", price: 36750.0, change: 2.34, volume: 28900000000 },
    { symbol: "ETH/USDT", price: 2480.75, change: 1.87, volume: 15200000000 },
    { symbol: "SOL/USDT", price: 142.3, change: -0.92, volume: 3800000000 },
    { symbol: "ADA/USDT", price: 0.485, change: 3.21, volume: 890000000 },
    { symbol: "DOT/USDT", price: 7.85, change: -1.45, volume: 420000000 },
    { symbol: "ETH/BTC", price: 0.0675, change: -0.32, volume: 5200000000 },
    { symbol: "SOL/BTC", price: 0.00387, change: -3.21, volume: 1200000000 },
    { symbol: "BNB/USDT", price: 580.25, change: 0.75, volume: 2100000000 },
    { symbol: "XRP/USDT", price: 0.625, change: 1.25, volume: 1800000000 },
  ]

  // Filter pairs based on search term and category
  const filteredPairs = tradingPairs.filter((pair) => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedCategory === "favorites") {
      return matchesSearch && favorites.includes(pair.symbol)
    } else if (selectedCategory === "usdt") {
      return matchesSearch && pair.symbol.endsWith("/USDT")
    } else if (selectedCategory === "btc") {
      return matchesSearch && pair.symbol.endsWith("/BTC")
    }

    return matchesSearch
  })

  // Toggle favorite status for a pair
  const toggleFavorite = (symbol: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setFavorites((prev) => (prev.includes(symbol) ? prev.filter((p) => p !== symbol) : [...prev, symbol]))
  }

  // Handle pair selection
  const handleSelectPair = (symbol: string) => {
    onPairChange(symbol)
    setOpen(false)
  }

  // Get base and quote currency from pair string
  const [baseCurrency, quoteCurrency] = currentPair.split("/")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 py-2 h-auto border-muted-foreground/20 hover:bg-muted"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {baseCurrency.slice(0, 2)}
          </div>
          <span className="font-medium">{currentPair}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Search pairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
            prefix={<Search className="h-4 w-4 text-muted-foreground mr-2" />}
          />
        </div>

        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="px-3 pt-2">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="usdt">USDT</TabsTrigger>
              <TabsTrigger value="btc">BTC</TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                Favs
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredPairs.length > 0 ? (
              filteredPairs.map((pair) => (
                <div
                  key={pair.symbol}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted",
                    currentPair === pair.symbol && "bg-muted",
                  )}
                  onClick={() => handleSelectPair(pair.symbol)}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(pair.symbol, e)}
                      className="text-muted-foreground hover:text-yellow-500 transition-colors"
                    >
                      <Star
                        className={cn("h-4 w-4", favorites.includes(pair.symbol) && "fill-yellow-500 text-yellow-500")}
                      />
                    </button>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {pair.symbol.split("/")[0].slice(0, 2)}
                    </div>
                    <span className="font-medium">{pair.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{pair.price.toLocaleString()}</div>
                    <div className={cn("text-xs", pair.change >= 0 ? "text-green-500" : "text-red-500")}>
                      {pair.change >= 0 ? "+" : ""}
                      {pair.change}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No pairs found</div>
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
