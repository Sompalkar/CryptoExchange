"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { fetchWithAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

interface OrderFormProps {
  pair: string
  currentPrice: number
}

export default function EnhancedOrderForm({ pair, currentPrice = 36750 }: OrderFormProps) {
  const { toast } = useToast()
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">("market")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [price, setPrice] = useState<string>(currentPrice.toString())
  const [amount, setAmount] = useState<string>("")
  const [total, setTotal] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [balancesLoading, setBalancesLoading] = useState(false)

  const baseCurrency = pair.split("/")[0]
  const quoteCurrency = pair.split("/")[1]

  // Get available balance for the selected side
  const availableBalance = side === "buy" ? balances[quoteCurrency] || 0 : balances[baseCurrency] || 0

  // Fetch user balances
  const fetchBalances = async () => {
    setBalancesLoading(true)
    try {
      const response = await fetchWithAuth("/api/wallet/balances")

      if (!response.ok) {
        throw new Error("Failed to fetch balances")
      }

      const data = await response.json()
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
      })
    } finally {
      setBalancesLoading(false)
    }
  }

  // Update price when current price changes
  useEffect(() => {
    if (orderType === "limit" && !price) {
      setPrice(currentPrice.toString())
    }
  }, [currentPrice, orderType, price])

  // Calculate total when price or amount changes
  useEffect(() => {
    if (price && amount && orderType !== "market") {
      setTotal((Number.parseFloat(price) * Number.parseFloat(amount)).toFixed(2))
    } else if (amount && orderType === "market") {
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
    if (value && price && orderType !== "market") {
      setTotal((Number.parseFloat(price) * Number.parseFloat(value)).toFixed(2))
    } else if (value && orderType === "market") {
      setTotal((currentPrice * Number.parseFloat(value)).toFixed(2))
    } else {
      setTotal("")
    }
  }

  const handleTotalChange = (value: string) => {
    setTotal(value)
    const priceToUse = orderType === "market" ? currentPrice : Number.parseFloat(price)
    if (value && priceToUse > 0) {
      setAmount((Number.parseFloat(value) / priceToUse).toFixed(8))
    } else {
      setAmount("")
    }
  }

  const handlePercentageClick = (percentage: number) => {
    if (side === "buy") {
      const maxTotal = availableBalance * (percentage / 100)
      const priceToUse = orderType === "market" ? currentPrice : Number.parseFloat(price || currentPrice.toString())
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
      const orderData = {
        pair,
        type: orderType,
        side,
        price: orderType === "market" ? null : Number.parseFloat(price),
        amount: Number.parseFloat(amount),
        total: Number.parseFloat(total),
      }

      const response = await fetchWithAuth("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to place order")
      }

      const data = await response.json()

      toast({
        title: "Order placed successfully",
        description: `${side === "buy" ? "Bought" : "Sold"} ${amount} ${baseCurrency} at ${orderType === "market" ? "market price" : price + " " + quoteCurrency}`,
        variant: "default",
      })

      // Reset form
      setAmount("")
      setTotal("")

      // Refresh balances
      fetchBalances()
    } catch (err) {
      console.error("Error placing order:", err)
      toast({
        title: "Failed to place order",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })

      // For demo purposes, show success anyway
      if (process.env.NODE_ENV === "development") {
        toast({
          title: "Demo Mode: Order simulated",
          description: `${side === "buy" ? "Bought" : "Sold"} ${amount} ${baseCurrency} at ${orderType === "market" ? "market price" : price + " " + quoteCurrency}`,
          variant: "default",
        })

        // Reset form
        setAmount("")
        setTotal("")
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    if (!amount || Number(amount) <= 0) return false
    if (orderType === "limit" && (!price || Number(price) <= 0)) return false
    return true
  }

  const estimatedFee = total ? (Number.parseFloat(total) * 0.001).toFixed(4) : "0.0000"

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-1 pt-2 px-2">
        <CardTitle className="text-xs">Place Order</CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-y-auto space-y-2">
        {/* Order Type Tabs */}
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "limit" | "market" | "stop")}>
          <TabsList className="grid grid-cols-3 w-full h-7">
            <TabsTrigger value="market" className="text-xs py-0.5">
              Market
            </TabsTrigger>
            <TabsTrigger value="limit" className="text-xs py-0.5">
              Limit
            </TabsTrigger>
            <TabsTrigger value="stop" className="text-xs py-0.5">
              Stop
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant={side === "buy" ? "default" : "outline"}
            className={`h-7 text-xs ${side === "buy" ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => setSide("buy")}
          >
            <ArrowDown className="mr-1 h-3 w-3" />
            Buy
          </Button>
          <Button
            variant={side === "sell" ? "default" : "outline"}
            className={`h-7 text-xs ${side === "sell" ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={() => setSide("sell")}
          >
            <ArrowUp className="mr-1 h-3 w-3" />
            Sell
          </Button>
        </div>

        {/* Available Balance */}
        <div className="flex items-center justify-between p-1.5 bg-muted/50 rounded-md">
          <span className="text-[10px]">Available:</span>
          <span className="text-[10px] font-medium">
            {balancesLoading
              ? "Loading..."
              : `${availableBalance.toFixed(side === "buy" ? 2 : 8)} ${side === "buy" ? quoteCurrency : baseCurrency}`}
          </span>
        </div>

        {/* Price Input (for limit orders) */}
        {orderType !== "market" && (
          <div>
            <Label className="text-[10px] font-medium">Price</Label>
            <div className="flex mt-0.5">
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-r-none h-7 text-xs"
              />
              <div className="bg-muted px-1.5 py-1 border border-l-0 rounded-r-md text-[10px] flex items-center">
                {quoteCurrency}
              </div>
            </div>
          </div>
        )}

        {/* Market Price Display */}
        {orderType === "market" && (
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <div className="flex items-center gap-1">
              <Badge variant="blue" className="text-[10px] px-1 h-4">
                Market
              </Badge>
              <span className="text-[10px] font-medium">${currentPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <Label className="text-[10px] font-medium">Amount</Label>
          <div className="flex mt-0.5">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="rounded-r-none h-7 text-xs"
            />
            <div className="bg-muted px-1.5 py-1 border border-l-0 rounded-r-md text-[10px] flex items-center">
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
              className="text-[10px] h-6"
            >
              {percent}%
            </Button>
          ))}
        </div>

        {/* Total Input */}
        <div>
          <Label className="text-[10px] font-medium">Total</Label>
          <div className="flex mt-0.5">
            <Input
              type="number"
              placeholder="0.00"
              value={total}
              onChange={(e) => handleTotalChange(e.target.value)}
              className="rounded-r-none h-7 text-xs"
            />
            <div className="bg-muted px-1.5 py-1 border border-l-0 rounded-r-md text-[10px] flex items-center">
              {quoteCurrency}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        {total && (
          <div className="space-y-0.5 p-1.5 bg-muted/30 rounded-md">
            <div className="flex justify-between text-[10px]">
              <span>Fee (0.1%):</span>
              <span>
                {estimatedFee} {quoteCurrency}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-medium">
              <span>Total:</span>
              <span>
                {(Number.parseFloat(total) + Number.parseFloat(estimatedFee)).toFixed(4)} {quoteCurrency}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          className={`w-full h-7 text-xs ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
          onClick={handleSubmitOrder}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <span className="flex items-center">Processing...</span>
          ) : (
            <span className="flex items-center">
              {side === "buy" ? "Buy" : "Sell"} {baseCurrency}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

