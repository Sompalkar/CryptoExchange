"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, Wallet, Calculator, Percent } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderFormProps {
  pair: string
  currentPrice: number
}

/**
 * EnhancedOrderForm - Minimalistic order placement component
 *
 * Features:
 * - Support for limit, market, and stop orders
 * - Real-time balance display
 * - Percentage-based amount selection
 * - Order validation and fee calculation
 * - Responsive design for all screen sizes
 * - Dark/light mode support
 * - Auto-calculation of total and amounts
 *
 * @param {string} pair - Trading pair in format "BTC/USDT"
 * @param {number} currentPrice - Current market price
 */
export default function EnhancedOrderForm({ pair, currentPrice = 36750 }: OrderFormProps) {
  // Order form state
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">("limit")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [price, setPrice] = useState<string>(currentPrice.toString())
  const [amount, setAmount] = useState<string>("")
  const [total, setTotal] = useState<string>("")
  const [stopPrice, setStopPrice] = useState<string>("")

  // Mock balances - in real app, this would come from props or context
  const [balances] = useState({
    BTC: 0.5,
    USDT: 10000,
    ETH: 5.0,
    SOL: 100,
    ADA: 1000,
    DOT: 50,
  })

  // Extract currencies from pair
  const [baseCurrency, quoteCurrency] = pair.split("/")

  // Get available balance based on order side
  const availableBalance =
    side === "buy"
      ? balances[quoteCurrency as keyof typeof balances] || 0
      : balances[baseCurrency as keyof typeof balances] || 0

  // Update price when currentPrice changes (for market orders)
  useEffect(() => {
    if (orderType === "market") {
      setPrice(currentPrice.toString())
    }
  }, [currentPrice, orderType])

  // Auto-calculate total when price or amount changes
  useEffect(() => {
    if (price && amount) {
      const priceNum = Number.parseFloat(price)
      const amountNum = Number.parseFloat(amount)
      if (!isNaN(priceNum) && !isNaN(amountNum)) {
        setTotal((priceNum * amountNum).toFixed(6))
      }
    } else {
      setTotal("")
    }
  }, [price, amount])

  /**
   * Handle amount input change and recalculate total
   */
  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value && price) {
      const priceNum = Number.parseFloat(price)
      const amountNum = Number.parseFloat(value)
      if (!isNaN(priceNum) && !isNaN(amountNum)) {
        setTotal((priceNum * amountNum).toFixed(6))
      }
    } else {
      setTotal("")
    }
  }

  /**
   * Handle total input change and recalculate amount
   */
  const handleTotalChange = (value: string) => {
    setTotal(value)
    const priceToUse = Number.parseFloat(price)
    if (value && !isNaN(priceToUse) && priceToUse > 0) {
      const totalNum = Number.parseFloat(value)
      if (!isNaN(totalNum)) {
        setAmount((totalNum / priceToUse).toFixed(8))
      }
    } else {
      setAmount("")
    }
  }

  /**
   * Handle percentage-based amount selection
   */
  const handlePercentageClick = (percentage: number) => {
    if (side === "buy") {
      // For buy orders, calculate based on available quote currency
      const maxTotal = availableBalance * (percentage / 100)
      const priceToUse = Number.parseFloat(price || currentPrice.toString())
      if (priceToUse > 0) {
        const newAmount = (maxTotal / priceToUse).toFixed(8)
        handleAmountChange(newAmount)
      }
    } else {
      // For sell orders, calculate based on available base currency
      const maxAmount = availableBalance * (percentage / 100)
      handleAmountChange(maxAmount.toFixed(8))
    }
  }

  /**
   * Handle order submission
   */
  const handleSubmitOrder = () => {
    const order = {
      pair,
      type: orderType,
      side,
      price: orderType === "market" ? null : Number.parseFloat(price),
      amount: Number.parseFloat(amount),
      total: Number.parseFloat(total),
      stopPrice: orderType === "stop" ? Number.parseFloat(stopPrice) : null,
      timestamp: new Date().toISOString(),
    }

    console.log("Submitting order:", order)
    // In a real app, this would call the API to place the order
  }

  /**
   * Validate if the form can be submitted
   */
  const isFormValid = () => {
    if (!amount || Number.parseFloat(amount) <= 0) return false
    if (orderType === "limit" && (!price || Number.parseFloat(price) <= 0)) return false
    if (
      orderType === "stop" &&
      (!price || !stopPrice || Number.parseFloat(price) <= 0 || Number.parseFloat(stopPrice) <= 0)
    )
      return false

    // Check if user has sufficient balance
    const totalCost = side === "buy" ? Number.parseFloat(total || "0") : Number.parseFloat(amount || "0")
    return totalCost <= availableBalance
  }

  // Calculate estimated fee (0.1% trading fee)
  const estimatedFee = total ? (Number.parseFloat(total) * 0.001).toFixed(6) : "0.000000"

  // Format balance display
  const formatBalance = (balance: number, currency: string) => {
    if (currency === "USDT" || balance > 1) {
      return balance.toFixed(2)
    }
    return balance.toFixed(8)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 px-3 flex-shrink-0">
        <CardTitle className="text-sm">Place Order</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-3 space-y-3 overflow-y-auto">
        {/* Order Type Tabs */}
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "limit" | "market" | "stop")}>
          <TabsList className="grid grid-cols-3 w-full h-8">
            <TabsTrigger value="limit" className="text-xs">
              Limit
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs">
              Market
            </TabsTrigger>
            <TabsTrigger value="stop" className="text-xs">
              Stop
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === "buy" ? "default" : "outline"}
            className={cn("h-8 text-xs", side === "buy" && "bg-green-600 hover:bg-green-700 text-white")}
            onClick={() => setSide("buy")}
          >
            <ArrowUp className="mr-1 h-3 w-3" />
            Buy
          </Button>
          <Button
            variant={side === "sell" ? "default" : "outline"}
            className={cn("h-8 text-xs", side === "sell" && "bg-red-600 hover:bg-red-700 text-white")}
            onClick={() => setSide("sell")}
          >
            <ArrowDown className="mr-1 h-3 w-3" />
            Sell
          </Button>
        </div>

        {/* Balance Display */}
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1">
            <Wallet className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Available:</span>
          </div>
          <span className="text-xs font-medium">
            {formatBalance(availableBalance, side === "buy" ? quoteCurrency : baseCurrency)}{" "}
            {side === "buy" ? quoteCurrency : baseCurrency}
          </span>
        </div>

        {/* Stop Price (for stop orders) */}
        {orderType === "stop" && (
          <div className="space-y-1">
            <Label className="text-xs">Stop Price</Label>
            <div className="flex">
              <Input
                type="number"
                placeholder="0.00"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="h-8 text-xs rounded-r-none"
              />
              <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
                {quoteCurrency}
              </div>
            </div>
          </div>
        )}

        {/* Price Input */}
        {orderType !== "market" ? (
          <div className="space-y-1">
            <Label className="text-xs">Price {orderType === "stop" && "(Limit)"}</Label>
            <div className="flex">
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-8 text-xs rounded-r-none"
              />
              <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
                {quoteCurrency}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                Market Price
              </Badge>
              <span className="text-xs font-medium">{currentPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-1">
          <Label className="text-xs">Amount</Label>
          <div className="flex">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="h-8 text-xs rounded-r-none"
            />
            <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
              {baseCurrency}
            </div>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[25, 50, 75, 100].map((percent) => (
            <Button
              key={percent}
              variant="outline"
              size="sm"
              onClick={() => handlePercentageClick(percent)}
              className="h-6 text-xs px-1"
            >
              <Percent className="h-2.5 w-2.5 mr-0.5" />
              {percent}
            </Button>
          ))}
        </div>

        {/* Total Input */}
        <div className="space-y-1">
          <Label className="text-xs">Total</Label>
          <div className="flex">
            <Input
              type="number"
              placeholder="0.00"
              value={total}
              onChange={(e) => handleTotalChange(e.target.value)}
              className="h-8 text-xs rounded-r-none"
            />
            <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
              {quoteCurrency}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        {total && (
          <div className="space-y-1 p-2 bg-muted/20 rounded-lg">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Est. Fee:</span>
              <span>
                {estimatedFee} {quoteCurrency}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span>Total Cost:</span>
              <span>
                {(Number.parseFloat(total) + Number.parseFloat(estimatedFee)).toFixed(6)} {quoteCurrency}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          className={cn(
            "w-full h-8 text-xs",
            side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700",
          )}
          onClick={handleSubmitOrder}
          disabled={!isFormValid()}
        >
          <Calculator className="mr-1 h-3 w-3" />
          {side === "buy" ? "Buy" : "Sell"} {baseCurrency}
        </Button>

        {/* Insufficient balance warning */}
        {total && !isFormValid() && amount && (
          <div className="text-xs text-red-500 text-center">
            Insufficient {side === "buy" ? quoteCurrency : baseCurrency} balance
          </div>
        )}
      </CardContent>
    </Card>
  )
}
