// "use client"

// import { useState, useEffect } from "react"
// import { ArrowUp, ArrowDown } from "lucide-react"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import OrderBook from "./order-book"
// import TradingChart from "./trading-chart"
// import RecentTrades from "./recent-trades"
// import { Badge } from "@/components/ui/badge"

// interface TradeViewProps {
//   pair: string
// }

// export default function TradeView({ pair = "BTC/USDT" }: TradeViewProps) {
//   const [orderType, setOrderType] = useState<"limit" | "market">("limit")
//   const [side, setSide] = useState<"buy" | "sell">("buy")
//   const [price, setPrice] = useState<string>("36750.00")
//   const [amount, setAmount] = useState<string>("")
//   const [total, setTotal] = useState<string>("")
//   const [lastPrice, setLastPrice] = useState<number>(36750.0)
//   const [priceChange, setPriceChange] = useState<number>(2.34)

//   // Calculate total when price or amount changes
//   useEffect(() => {
//     if (price && amount) {
//       setTotal((Number.parseFloat(price) * Number.parseFloat(amount)).toFixed(2))
//     } else {
//       setTotal("")
//     }
//   }, [price, amount])

//   // Handle amount change and recalculate total
//   const handleAmountChange = (value: string) => {
//     setAmount(value)
//     if (value && price) {
//       setTotal((Number.parseFloat(price) * Number.parseFloat(value)).toFixed(2))
//     } else {
//       setTotal("")
//     }
//   }

//   // Handle total change and recalculate amount
//   const handleTotalChange = (value: string) => {
//     setTotal(value)
//     if (value && price && Number.parseFloat(price) > 0) {
//       setAmount((Number.parseFloat(value) / Number.parseFloat(price)).toFixed(8))
//     } else {
//       setAmount("")
//     }
//   }

//   // Handle order submission
//   const handleSubmitOrder = () => {
//     const order = {
//       pair,
//       type: orderType,
//       side,
//       price: orderType === "limit" ? Number.parseFloat(price) : null,
//       amount: Number.parseFloat(amount),
//       total: Number.parseFloat(total),
//       timestamp: new Date().toISOString(),
//     }

//     console.log("Submitting order:", order)
//     // Here you would call your API to submit the order
//     // fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) })
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
//       {/* Left column - Order Book & Recent Trades */}
//       <div className="lg:col-span-1 space-y-4">
//         <Card>
//           <CardHeader className="pb-3">
//             <div className="flex justify-between items-center">
//               <div>
//                 <CardTitle className="text-xl">{pair}</CardTitle>
//                 <CardDescription className="flex items-center mt-1">
//                   <span className="text-lg font-medium">${lastPrice.toLocaleString()}</span>
//                   <Badge className={`ml-2 ${priceChange >= 0 ? "bg-green-500" : "bg-red-500"}`}>
//                     {priceChange >= 0 ? "+" : ""}
//                     {priceChange}%
//                   </Badge>
//                 </CardDescription>
//               </div>
//               <Select defaultValue="1h">
//                 <SelectTrigger className="w-20">
//                   <SelectValue placeholder="Timeframe" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="5m">5m</SelectItem>
//                   <SelectItem value="15m">15m</SelectItem>
//                   <SelectItem value="1h">1h</SelectItem>
//                   <SelectItem value="4h">4h</SelectItem>
//                   <SelectItem value="1d">1d</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardHeader>
//         </Card>

//         <Tabs defaultValue="order-book">
//           <TabsList className="grid grid-cols-2 w-full">
//             <TabsTrigger value="order-book">Order Book</TabsTrigger>
//             <TabsTrigger value="recent-trades">Recent Trades</TabsTrigger>
//           </TabsList>
//           <TabsContent value="order-book">
//             <OrderBook pair={pair} />
//           </TabsContent>
//           <TabsContent value="recent-trades">
//             <RecentTrades pair={pair} />
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Middle column - Chart */}
//       <div className="lg:col-span-1">
//         <Card className="h-full">
//           <CardContent className="p-0">
//             <TradingChart pair={pair} />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Right column - Order Form */}
//       <div className="lg:col-span-1">
//         <Card>
//           <CardHeader>
//             <CardTitle>Place Order</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="limit" onValueChange={(value) => setOrderType(value as "limit" | "market")}>
//               <TabsList className="grid grid-cols-2 w-full mb-4">
//                 <TabsTrigger value="limit">Limit</TabsTrigger>
//                 <TabsTrigger value="market">Market</TabsTrigger>
//               </TabsList>

//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <Button
//                   variant={side === "buy" ? "default" : "outline"}
//                   className={side === "buy" ? "bg-green-600 hover:bg-green-700" : ""}
//                   onClick={() => setSide("buy")}
//                 >
//                   <ArrowDown className="mr-2 h-4 w-4" />
//                   Buy
//                 </Button>
//                 <Button
//                   variant={side === "sell" ? "default" : "outline"}
//                   className={side === "sell" ? "bg-red-600 hover:bg-red-700" : ""}
//                   onClick={() => setSide("sell")}
//                 >
//                   <ArrowUp className="mr-2 h-4 w-4" />
//                   Sell
//                 </Button>
//               </div>

//               <div className="space-y-4">
//                 {orderType === "limit" && (
//                   <div>
//                     <label className="text-sm font-medium">Price</label>
//                     <div className="flex mt-1">
//                       <Input
//                         type="number"
//                         placeholder="0.00"
//                         value={price}
//                         onChange={(e) => setPrice(e.target.value)}
//                       />
//                       <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">USDT</div>
//                     </div>
//                   </div>
//                 )}

//                 <div>
//                   <label className="text-sm font-medium">Amount</label>
//                   <div className="flex mt-1">
//                     <Input
//                       type="number"
//                       placeholder="0.00"
//                       value={amount}
//                       onChange={(e) => handleAmountChange(e.target.value)}
//                     />
//                     <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">BTC</div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium">Total</label>
//                   <div className="flex mt-1">
//                     <Input
//                       type="number"
//                       placeholder="0.00"
//                       value={total}
//                       onChange={(e) => handleTotalChange(e.target.value)}
//                     />
//                     <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">USDT</div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-4 gap-2 py-2">
//                   {[25, 50, 75, 100].map((percent) => (
//                     <Button
//                       key={percent}
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         // Simulate having a balance of 10000 USDT for buy or 1 BTC for sell
//                         const maxAmount = side === "buy" ? 10000 / Number.parseFloat(price || "1") : 1
//                         const newAmount = ((maxAmount * percent) / 100).toFixed(8)
//                         handleAmountChange(newAmount)
//                       }}
//                     >
//                       {percent}%
//                     </Button>
//                   ))}
//                 </div>

//                 <Button
//                   className="w-full mt-2"
//                   onClick={handleSubmitOrder}
//                   disabled={!amount || (orderType === "limit" && !price)}
//                   variant={side === "buy" ? "default" : "destructive"}
//                 >
//                   {side === "buy" ? "Buy" : "Sell"} {pair.split("/")[0]}
//                 </Button>
//               </div>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
