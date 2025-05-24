"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Balance {
  currency: string
  available: number
  locked: number
  total: number
  usdValue: number
}

interface Transaction {
  id: string
  type: "deposit" | "withdrawal"
  currency: string
  amount: number
  status: "pending" | "completed" | "failed"
  timestamp: string
  txHash?: string
  fee?: number
}

export default function WalletPage() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [hideBalances, setHideBalances] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>("")

  // Mock API calls
  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true)
      try {
        // Simulate API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockBalances: Balance[] = [
          {
            currency: "BTC",
            available: 0.5,
            locked: 0.1,
            total: 0.6,
            usdValue: 22050,
          },
          {
            currency: "ETH",
            available: 5.0,
            locked: 1.0,
            total: 6.0,
            usdValue: 14884.5,
          },
          {
            currency: "USDT",
            available: 10000.0,
            locked: 2000.0,
            total: 12000.0,
            usdValue: 12000,
          },
          {
            currency: "SOL",
            available: 25.5,
            locked: 4.5,
            total: 30.0,
            usdValue: 4269,
          },
        ]

        const mockTransactions: Transaction[] = [
          {
            id: "tx1",
            type: "deposit",
            currency: "BTC",
            amount: 0.1,
            status: "completed",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            txHash: "0x123456789abcdef",
          },
          {
            id: "tx2",
            type: "withdrawal",
            currency: "ETH",
            amount: 0.5,
            status: "pending",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            fee: 0.001,
          },
          {
            id: "tx3",
            type: "deposit",
            currency: "USDT",
            amount: 5000,
            status: "completed",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            txHash: "0xabcdef123456789",
          },
        ]

        setBalances(mockBalances)
        setTransactions(mockTransactions)
      } catch (error) {
        console.error("Failed to fetch wallet data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  const totalUsdValue = balances.reduce((sum, balance) => sum + balance.usdValue, 0)

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USDT") return `$${amount.toLocaleString()}`
    return `${amount.toFixed(currency === "BTC" ? 8 : 4)} ${currency}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Wallet</h1>
            <p className="text-muted-foreground">Manage your cryptocurrency assets</p>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setHideBalances(!hideBalances)}>
            {hideBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Portfolio Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {hideBalances ? "****" : `$${totalUsdValue.toLocaleString()}`}
            </div>
            <p className="text-muted-foreground">Total Portfolio Value</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="balances" className="space-y-6">
          <TabsList>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="balances">
            <Card>
              <CardHeader>
                <CardTitle>Your Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
                              <div className="w-24 h-3 bg-muted rounded animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                            <div className="w-16 h-3 bg-muted rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    : balances.map((balance) => (
                        <motion.div
                          key={balance.currency}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold">
                              {balance.currency.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium">{balance.currency}</div>
                              <div className="text-sm text-muted-foreground">
                                Available: {hideBalances ? "****" : formatCurrency(balance.available, balance.currency)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {hideBalances ? "****" : formatCurrency(balance.total, balance.currency)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {hideBalances ? "****" : `$${balance.usdValue.toLocaleString()}`}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deposit-currency">Select Currency</Label>
                  <select
                    id="deposit-currency"
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="">Select a currency</option>
                    {balances.map((balance) => (
                      <option key={balance.currency} value={balance.currency}>
                        {balance.currency}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCurrency && (
                  <div className="space-y-4">
                    <div>
                      <Label>Deposit Address</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Important Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Only send {selectedCurrency} to this address</li>
                        <li>• Minimum deposit: 0.001 {selectedCurrency}</li>
                        <li>• Deposits require 3 network confirmations</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-currency">Select Currency</Label>
                  <select
                    id="withdraw-currency"
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="">Select a currency</option>
                    {balances.map((balance) => (
                      <option key={balance.currency} value={balance.currency}>
                        {balance.currency} (Available: {balance.available})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCurrency && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="withdraw-address">Withdrawal Address</Label>
                      <Input
                        id="withdraw-address"
                        placeholder="Enter withdrawal address"
                        className="font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="withdraw-amount">Amount</Label>
                      <Input id="withdraw-amount" type="number" placeholder="0.00" step="0.00000001" />
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Network Fee:</span>
                        <span>0.0001 {selectedCurrency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>You will receive:</span>
                        <span>- {selectedCurrency}</span>
                      </div>
                    </div>

                    <Button className="w-full" variant="gradient">
                      Withdraw {selectedCurrency}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${tx.type === "deposit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                        >
                          {tx.type === "deposit" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{tx.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(tx.amount, tx.currency)}</div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              tx.status === "completed"
                                ? "default"
                                : tx.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {tx.status}
                          </Badge>
                          {tx.txHash && (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
