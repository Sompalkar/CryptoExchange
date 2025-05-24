"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  pair: string
  type: "limit" | "market"
  side: "buy" | "sell"
  amount: number
  price?: number
  filled: number
  status: "open" | "filled" | "partially_filled" | "canceled"
  timestamp: string
  fee?: number
}

interface Trade {
  id: string
  orderId: string
  pair: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  timestamp: string
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7d")

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockOrders: Order[] = [
          {
            id: "order1",
            pair: "BTC/USDT",
            type: "limit",
            side: "buy",
            amount: 0.5,
            price: 36500,
            filled: 0.5,
            status: "filled",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            fee: 18.25,
          },
          {
            id: "order2",
            pair: "ETH/USDT",
            type: "market",
            side: "sell",
            amount: 2.0,
            filled: 2.0,
            status: "filled",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            fee: 4.96,
          },
          {
            id: "order3",
            pair: "SOL/USDT",
            type: "limit",
            side: "buy",
            amount: 10,
            price: 140,
            filled: 5,
            status: "partially_filled",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            fee: 3.5,
          },
        ]

        const mockTrades: Trade[] = [
          {
            id: "trade1",
            orderId: "order1",
            pair: "BTC/USDT",
            side: "buy",
            amount: 0.5,
            price: 36500,
            fee: 18.25,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "trade2",
            orderId: "order2",
            pair: "ETH/USDT",
            side: "sell",
            amount: 2.0,
            price: 2480,
            fee: 4.96,
            timestamp: new Date(Date.now() - 172800000).toISOString(),
          },
        ]

        setOrders(mockOrders)
        setTrades(mockTrades)
      } catch (error) {
        console.error("Failed to fetch history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [dateRange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled":
        return "default"
      case "open":
        return "blue"
      case "partially_filled":
        return "secondary"
      case "canceled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trading History</h1>
            <p className="text-muted-foreground">View your trading activity and order history</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="p-2 border rounded-md bg-background"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Pair</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Side</th>
                        <th className="text-right p-4 font-medium">Amount</th>
                        <th className="text-right p-4 font-medium">Price</th>
                        <th className="text-right p-4 font-medium">Filled</th>
                        <th className="text-right p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-4">
                                <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-12 h-4 bg-muted rounded animate-pulse"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-8 h-4 bg-muted rounded animate-pulse"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-16 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-20 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-12 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-16 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                              </td>
                              <td className="p-4">
                                <div className="w-12 h-4 bg-muted rounded animate-pulse ml-auto"></div>
                              </td>
                            </tr>
                          ))
                        : orders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-muted/30">
                              <td className="p-4 text-sm">{new Date(order.timestamp).toLocaleDateString()}</td>
                              <td className="p-4 font-medium">{order.pair}</td>
                              <td className="p-4">
                                <Badge variant="outline">{order.type}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={order.side === "buy" ? "default" : "destructive"}>{order.side}</Badge>
                              </td>
                              <td className="p-4 text-right">{order.amount}</td>
                              <td className="p-4 text-right">
                                {order.price ? `$${order.price.toLocaleString()}` : "Market"}
                              </td>
                              <td className="p-4 text-right">{((order.filled / order.amount) * 100).toFixed(1)}%</td>
                              <td className="p-4 text-right">
                                <Badge variant={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                              </td>
                              <td className="p-4 text-right">${order.fee?.toFixed(2) || "0.00"}</td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Pair</th>
                        <th className="text-left p-4 font-medium">Side</th>
                        <th className="text-right p-4 font-medium">Amount</th>
                        <th className="text-right p-4 font-medium">Price</th>
                        <th className="text-right p-4 font-medium">Total</th>
                        <th className="text-right p-4 font-medium">Fee</th>
                        <th className="text-right p-4 font-medium">Order ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id} className="border-b hover:bg-muted/30">
                          <td className="p-4 text-sm">{new Date(trade.timestamp).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">{trade.pair}</td>
                          <td className="p-4">
                            <Badge variant={trade.side === "buy" ? "default" : "destructive"}>{trade.side}</Badge>
                          </td>
                          <td className="p-4 text-right">{trade.amount}</td>
                          <td className="p-4 text-right">${trade.price.toLocaleString()}</td>
                          <td className="p-4 text-right">${(trade.amount * trade.price).toLocaleString()}</td>
                          <td className="p-4 text-right">${trade.fee.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="sm" className="font-mono text-xs">
                              {trade.orderId}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Deposit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">No deposits found for the selected period</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No withdrawals found for the selected period
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
