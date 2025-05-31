"use client"

import { useState, useEffect } from "react"
import { Wallet, Calculator, TrendingUp, TrendingDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { OrderRequest, BalanceResponse } from "@/types/api"

interface OrderFormProps {
  pair: string
  currentPrice: number
}

export default function EnhancedOrderForm({ pair, currentPrice = 36750 }: OrderFormProps) {
  const { toast } = useToast()
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET" | "STOP">("MARKET")
  const [side, setSide] = useState<"BUY" | "SELL">("BUY")
  const [price, setPrice] = useState<string>(currentPrice.toString())
  const [amount, setAmount] = useState<string>("")
  const [total, setTotal] = useState<string>("")
  const [stopPrice, setStopPrice] = useState<string>("")
  const [percentageValue, setPercentageValue] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [balancesLoading, setBalancesLoading] = useState(false)

  const baseCurrency = pair.split("/")[0]
  const quoteCurrency = pair.split("/")[1]

  // Get available balance for the selected side
  const availableBalance = side === "BUY" ? balances[quoteCurrency] || 0 : balances[baseCurrency] || 0

  // Fetch user balances with API integration
  const fetchBalances = async () => {
    setBalancesLoading(true)
    try {
      const data: BalanceResponse = await apiRequest("/api/wallet/balances")
      setBalances(data.balances || {})
    } catch (err) {
      console.error("Error fetching balances:", err)
      // Set demo balances as fallback
      setBalances({
        BTC: 0.5,
        USDT: 10000,
        ETH: 5.0,
        SOL: 25,
        ADA: 1000,
        DOT: 100,
        MATIC: 500,
        LINK: 50,
        UNI: 100,
      })
    } finally {
      setBalancesLoading(false)
    }
  }

  // Update price when current price changes
  useEffect(() => {
    if (orderType === "LIMIT" && !price) {
      setPrice(currentPrice.toString())
    }
  }, [currentPrice, orderType, price])

  // Calculate total when price or amount changes
  useEffect(() => {
    if (price && amount && orderType !== "MARKET") {
      setTotal((Number.parseFloat(price) * Number.parseFloat(amount)).toFixed(2))
    } else if (amount && orderType === "MARKET") {
      setTotal((currentPrice * Number.parseFloat(amount)).toFixed(2))
    } else {
      setTotal("")
    }
  }, [price, amount, orderType, currentPrice])

  // Fetch balances on component mount and when pair changes
  useEffect(() => {
    fetchBalances()
  }, [pair])

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value && price && orderType !== "MARKET") {
      setTotal((Number.parseFloat(price) * Number.parseFloat(value)).toFixed(2))
    } else if (value && orderType === "MARKET") {
      setTotal((currentPrice * Number.parseFloat(value)).toFixed(2))
    } else {
      setTotal("")
    }
  }

  const handleTotalChange = (value: string) => {
    setTotal(value)
    const priceToUse = orderType === "MARKET" ? currentPrice : Number.parseFloat(price)
    if (value && priceToUse > 0) {
      setAmount((Number.parseFloat(value) / priceToUse).toFixed(8))
    } else {
      setAmount("")
    }
  }

  const handlePercentageChange = (value: number[]) => {
    setPercentageValue(value[0])
    handlePercentageClick(value[0])
  }

  const handlePercentageClick = (percentage: number) => {
    if (side === "BUY") {
      const maxTotal = availableBalance * (percentage / 100)
      const priceToUse = orderType === "MARKET" ? currentPrice : Number.parseFloat(price || currentPrice.toString())
      const newAmount = (maxTotal / priceToUse).toFixed(8)
      handleAmountChange(newAmount)
    } else {
      const maxAmount = availableBalance * (percentage / 100)
      handleAmountChange(maxAmount.toFixed(8))
    }
  }

  const handleSubmitOrder = async () => {
    if (!isFormValid()) return

    setLoading(true)

    try {
      const orderData: OrderRequest = {
        pair,
        type: orderType,
        side,
        amount: Number.parseFloat(amount),
      }

      // Add price for limit and stop orders
      if (orderType !== "MARKET") {
        orderData.price = Number.parseFloat(price)
      }

      // Add stop price for stop orders
      if (orderType === "STOP") {
        orderData.stopPrice = Number.parseFloat(stopPrice)
      }

      const response = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      })

      toast({
        title: "Order placed successfully",
        description: `${side === "BUY" ? "Bought" : "Sold"} ${amount} ${baseCurrency} at ${orderType === "MARKET" ? "market price" : price + " " + quoteCurrency}`,
        variant: "default",
      })

      // Reset form
      setAmount("")
      setTotal("")
      setPercentageValue(0)

      // Refresh balances
      fetchBalances()
    } catch (err) {
      console.error("Error placing order:", err)

      // For demo purposes, show success anyway in development
      if (process.env.NODE_ENV === "development") {
        toast({
          title: "Demo Mode: Order simulated",
          description: `${side === "BUY" ? "Bought" : "Sold"} ${amount} ${baseCurrency} at ${orderType === "MARKET" ? "market price" : price + " " + quoteCurrency}`,
          variant: "default",
        })

        // Reset form
        setAmount("")
        setTotal("")
        setPercentageValue(0)
      } else {
        toast({
          title: "Failed to place order",
          description: err instanceof Error ? err.message : "An error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    if (!amount || Number(amount) <= 0) return false
    if (orderType === "LIMIT" && (!price || Number(price) <= 0)) return false
    if (orderType === "STOP" && (!price || !stopPrice || Number(price) <= 0 || Number(stopPrice) <= 0)) return false
    return true
  }

  const estimatedFee = total ? (Number.parseFloat(total) * 0.001).toFixed(4) : "0.0000"

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm flex items-center gap-2">
          Place Order
          <Badge variant="outline" className="text-xs">
            {side === "BUY" ? "Buy" : "Sell"} {baseCurrency}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex-1 overflow-y-auto space-y-3">
        {/* Order Type Tabs */}
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "LIMIT" | "MARKET" | "STOP")}>
          <TabsList className="grid grid-cols-3 w-full h-8">
            <TabsTrigger value="MARKET" className="text-xs">
              Market
            </TabsTrigger>
            <TabsTrigger value="LIMIT" className="text-xs">
              Limit
            </TabsTrigger>
            <TabsTrigger value="STOP" className="text-xs">
              Stop
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === "BUY" ? "default" : "outline"}
            className={`h-8 text-xs ${side === "BUY" ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => setSide("BUY")}
          >
            <TrendingUp className="mr-1 h-3 w-3" />
            Buy
          </Button>
          <Button
            variant={side === "SELL" ? "default" : "outline"}
            className={`h-8 text-xs ${side === "SELL" ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={() => setSide("SELL")}
          >
            <TrendingDown className="mr-1 h-3 w-3" />
            Sell
          </Button>
        </div>

        {/* Balance Display */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">Available:</span>
          </div>
          <span className="text-xs font-medium">
            {balancesLoading
              ? "Loading..."
              : `${availableBalance.toFixed(side === "BUY" ? 2 : 8)} ${side === "BUY" ? quoteCurrency : baseCurrency}`}
          </span>
        </div>

        {/* Stop Price (for stop orders) */}
        {orderType === "STOP" && (
          <div>
            <Label className="text-xs font-medium">Stop Price</Label>
            <div className="flex mt-1">
              <Input
                type="number"
                placeholder="0.00"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="rounded-r-none h-8 text-sm"
              />
              <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
                {quoteCurrency}
              </div>
            </div>
          </div>
        )}

        {/* Price Input (for limit and stop orders) */}
        {orderType !== "MARKET" && (
          <div>
            <Label className="text-xs font-medium">Price {orderType === "STOP" && "(Limit)"}</Label>
            <div className="flex mt-1">
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-r-none h-8 text-sm"
              />
              <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
                {quoteCurrency}
              </div>
            </div>
          </div>
        )}

        {/* Market Price Display */}
        {orderType === "MARKET" && (
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="blue" className="text-xs">
                Market Price
              </Badge>
              <span className="text-sm font-medium">${currentPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <Label className="text-xs font-medium">Amount</Label>
          <div className="flex mt-1">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="rounded-r-none h-8 text-sm"
            />
            <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
              {baseCurrency}
            </div>
          </div>
        </div>

        {/* Percentage Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">{percentageValue}%</span>
            <span>100%</span>
          </div>
          <Slider
            value={[percentageValue]}
            min={0}
            max={100}
            step={1}
            onValueChange={handlePercentageChange}
            className="py-1"
          />
          <div className="grid grid-cols-4 gap-1">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                onClick={() => {
                  setPercentageValue(percent)
                  handlePercentageClick(percent)
                }}
                className="text-xs h-7"
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        {/* Total Input */}
        <div>
          <Label className="text-xs font-medium">Total</Label>
          <div className="flex mt-1">
            <Input
              type="number"
              placeholder="0.00"
              value={total}
              onChange={(e) => handleTotalChange(e.target.value)}
              className="rounded-r-none h-8 text-sm"
            />
            <div className="bg-muted px-2 py-1 border border-l-0 rounded-r-md text-xs flex items-center">
              {quoteCurrency}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        {total && (
          <div className="space-y-1 p-2 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-xs">
              <span>Estimated Fee (0.1%):</span>
              <span>
                {estimatedFee} {quoteCurrency}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span>Total Cost:</span>
              <span>
                {(Number.parseFloat(total) + Number.parseFloat(estimatedFee)).toFixed(4)} {quoteCurrency}
              </span>
            </div>
            {orderType !== "MARKET" && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Est. Slippage:</span>
                <span>~0.05%</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Submit Button - Fixed at bottom */}
      <div className="p-3 pt-0">
        <Button
          className={`w-full h-9 text-sm font-medium ${
            side === "BUY" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          onClick={handleSubmitOrder}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Calculator className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <Calculator className="mr-2 h-4 w-4" />
              {side === "BUY" ? "Buy" : "Sell"} {baseCurrency}
            </span>
          )}
        </Button>
      </div>
    </Card>
  )
}
