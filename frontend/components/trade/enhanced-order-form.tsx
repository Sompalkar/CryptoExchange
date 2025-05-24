"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, Wallet, Calculator } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

interface OrderFormProps {
  pair: string
  currentPrice: number
}

export default function EnhancedOrderForm({ pair, currentPrice = 36750 }: OrderFormProps) {
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop">("limit")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [price, setPrice] = useState<string>(currentPrice.toString())
  const [amount, setAmount] = useState<string>("")
  const [total, setTotal] = useState<string>("")
  const [stopPrice, setStopPrice] = useState<string>("")
  const [percentageValue, setPercentageValue] = useState<number>(0)

  // Mock balances
  const [balances] = useState({
    BTC: 0.5,
    USDT: 10000,
    ETH: 5.0,
  })

  const baseCurrency = pair.split("/")[0]
  const quoteCurrency = pair.split("/")[1]
  const availableBalance =
    side === "buy" ? balances[quoteCurrency as keyof typeof balances] : balances[baseCurrency as keyof typeof balances]

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

  const handlePercentageChange = (value: number[]) => {
    setPercentageValue(value[0])
    handlePercentageClick(value[0])
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
    // API call would go here
  }

  const isFormValid = () => {
    if (!amount) return false
    if (orderType === "limit" && !price) return false
    if (orderType === "stop" && (!price || !stopPrice)) return false
    return true
  }

  const estimatedFee = total ? (Number.parseFloat(total) * 0.001).toFixed(4) : "0.0000"

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-base">Place Order</CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex-1 overflow-y-auto space-y-3">
        {/* Order Type Tabs */}
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "limit" | "market" | "stop")}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="stop">Stop</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === "buy" ? "default" : "outline"}
            className={side === "buy" ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={() => setSide("buy")}
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Buy
          </Button>
          <Button
            variant={side === "sell" ? "default" : "outline"}
            className={side === "sell" ? "bg-red-600 hover:bg-red-700" : ""}
            onClick={() => setSide("sell")}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
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
            {availableBalance?.toFixed(side === "buy" ? 2 : 8)} {side === "buy" ? quoteCurrency : baseCurrency}
          </span>
        </div>

        {/* Stop Price (for stop orders) */}
        {orderType === "stop" && (
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

        {/* Price Input */}
        {orderType !== "market" && (
          <div>
            <Label className="text-xs font-medium">Price {orderType === "stop" && "(Limit)"}</Label>
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

        {orderType === "market" && (
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="blue">Market Price</Badge>
              <span className="text-xs font-medium">${currentPrice.toLocaleString()}</span>
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
            <span>{percentageValue}%</span>
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
          <div className="grid grid-cols-4 gap-2">
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
              <span>Estimated Fee:</span>
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
          </div>
        )}
      </CardContent>

      {/* Submit Button - Fixed at bottom */}
      <div className="p-3 pt-0">
        <Button
          className="w-full"
          onClick={handleSubmitOrder}
          disabled={!isFormValid()}
          variant={side === "buy" ? "default" : "destructive"}
          size="sm"
        >
          <Calculator className="mr-2 h-4 w-4" />
          {side === "buy" ? "Buy" : "Sell"} {baseCurrency}
        </Button>
      </div>
    </Card>
  )
}
