"use client"
import { ArrowRight, Shield, Zap, Globe, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  const { scrollY } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Web3 Inspired */}
      <section ref={heroRef} className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50 z-10"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.6 }}
            transition={{ duration: 3, delay: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.6 }}
            transition={{ duration: 2.5, delay: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-cyan-500 rounded-full filter blur-3xl"
          ></motion.div>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary mb-6"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">The Future of Crypto Trading</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-purple-500 to-blue-600"
            >
              Trade Crypto with Confidence
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              NexusX provides a secure, reliable, and user-friendly platform for trading cryptocurrencies with advanced
              tools for both beginners and professional traders.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button
                variant="gradient"
                size="lg"
                className="rounded-xl"
                onClick={() => (window.location.href = "/register")}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 hover:bg-primary/10 rounded-xl"
                onClick={() => (window.location.href = "/markets")}
              >
                View Markets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Mac-style browser widget */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 relative max-w-5xl mx-auto"
          >
            <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-muted/50 px-4 py-3 border-b flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto bg-background/80 rounded-full px-4 py-1 text-xs text-center max-w-xs">
                  nexusx.exchange/trade
                </div>
              </div>

              {/* Browser content */}
              <div className="relative">
                <div className="bg-gradient-to-r from-violet-900/20 to-blue-900/20 p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <div className="bg-card border rounded-xl p-4 h-[300px] flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-lg flex items-center justify-center">
                          <svg className="w-full h-full opacity-30" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <path
                              d="M0,25 L20,15 L40,35 L60,10 L80,30 L100,20"
                              fill="none"
                              stroke="url(#gradient)"
                              strokeWidth="2"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#3B82F6" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-sm font-medium mb-2">BTC/USDT</div>
                        <div className="text-2xl font-bold text-green-500">$36,750.00</div>
                        <div className="text-xs text-green-500">+2.34%</div>
                      </div>
                      <div className="bg-card border rounded-xl p-4 h-[200px] flex flex-col justify-between">
                        <div>
                          <div className="text-sm font-medium mb-2">Buy BTC</div>
                          <div className="space-y-2">
                            <div className="bg-muted/50 rounded-lg p-2 text-xs">Price: 36,750.00 USDT</div>
                            <div className="bg-muted/50 rounded-lg p-2 text-xs">Amount: 0.5 BTC</div>
                          </div>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700 rounded-lg">Buy</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full filter blur-xl"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full filter blur-xl"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Crypto Ticker Section */}
      <section className="py-10 bg-gradient-to-r from-violet-500/5 to-blue-500/5 border-y border-border/50">
        <div className="container">
          <div className="flex overflow-hidden">
            <motion.div
              animate={{ x: [0, -2000] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 30, ease: "linear" }}
              className="flex gap-8 items-center whitespace-nowrap"
            >
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="font-bold text-orange-500">₿</span>
                    </div>
                    <div>
                      <span className="font-medium">BTC</span>
                      <span className="text-green-500 ml-2">+2.34%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="font-bold text-purple-500">Ξ</span>
                    </div>
                    <div>
                      <span className="font-medium">ETH</span>
                      <span className="text-green-500 ml-2">+1.87%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="font-bold text-teal-500">S</span>
                    </div>
                    <div>
                      <span className="font-medium">SOL</span>
                      <span className="text-red-500 ml-2">-0.92%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-500">A</span>
                    </div>
                    <div>
                      <span className="font-medium">ADA</span>
                      <span className="text-green-500 ml-2">+3.21%</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="purple" className="mb-4 px-3 py-1 rounded-full">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-600">
              Why Choose NexusX
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide a comprehensive suite of tools and features designed to make cryptocurrency trading accessible
              and profitable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all group"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-violet-500/20 to-violet-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-violet-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Storage</h3>
              <p className="text-muted-foreground">
                Industry-leading security measures to protect your assets with cold storage and regular security audits.
              </p>
              <div className="mt-4 flex items-center text-violet-500 font-medium">
                <span className="text-sm">Learn more</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all group"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                High-performance trading engine capable of processing thousands of transactions per second.
              </p>
              <div className="mt-4 flex items-center text-blue-500 font-medium">
                <span className="text-sm">Learn more</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all group"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="h-7 w-7 text-cyan-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 2V19C2 20.66 3.34 22 5 22H22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 17L10 12L13 15L22 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6H16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Trading</h3>
              <p className="text-muted-foreground">
                Professional trading tools including real-time charts, technical indicators, and order book depth.
              </p>
              <div className="mt-4 flex items-center text-cyan-500 font-medium">
                <span className="text-sm">Learn more</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all group"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Access</h3>
              <p className="text-muted-foreground">
                Available in over 100 countries with multi-language support and 24/7 customer service.
              </p>
              <div className="mt-4 flex items-center text-indigo-500 font-medium">
                <span className="text-sm">Learn more</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="py-20 bg-gradient-to-r from-violet-500/5 to-blue-500/5 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="blue" className="mb-4 px-3 py-1 rounded-full">
              Markets
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600">
              Market Overview
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest cryptocurrency prices and market trends.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-6 py-4 text-left">Asset</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-right">24h Change</th>
                    <th className="px-6 py-4 text-right">24h Volume</th>
                    <th className="px-6 py-4 text-right">Market Cap</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Bitcoin */}
                  <motion.tr
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    viewport={{ once: true }}
                    className="border-b hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                          <span className="font-bold">₿</span>
                        </div>
                        <div>
                          <div className="font-medium">Bitcoin</div>
                          <div className="text-xs text-muted-foreground">BTC</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">$36,750.00</td>
                    <td className="px-6 py-4 text-right text-green-500">+2.34%</td>
                    <td className="px-6 py-4 text-right">$28.9B</td>
                    <td className="px-6 py-4 text-right">$712.5B</td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/trade/btc-usdt">
                        <Button size="sm" variant="gradient" className="rounded-lg">
                          Trade
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>

                  {/* Ethereum */}
                  <motion.tr
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="border-b hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
                          <span className="font-bold">Ξ</span>
                        </div>
                        <div>
                          <div className="font-medium">Ethereum</div>
                          <div className="text-xs text-muted-foreground">ETH</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">$2,480.75</td>
                    <td className="px-6 py-4 text-right text-green-500">+1.87%</td>
                    <td className="px-6 py-4 text-right">$15.2B</td>
                    <td className="px-6 py-4 text-right">$298.3B</td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/trade/eth-usdt">
                        <Button size="sm" variant="gradient" className="rounded-lg">
                          Trade
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>

                  {/* Solana */}
                  <motion.tr
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="border-b hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white">
                          <span className="font-bold">S</span>
                        </div>
                        <div>
                          <div className="font-medium">Solana</div>
                          <div className="text-xs text-muted-foreground">SOL</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">$142.30</td>
                    <td className="px-6 py-4 text-right text-red-500">-0.92%</td>
                    <td className="px-6 py-4 text-right">$3.8B</td>
                    <td className="px-6 py-4 text-right">$61.5B</td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/trade/sol-usdt">
                        <Button size="sm" variant="gradient" className="rounded-lg">
                          Trade
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/markets">
              <Button variant="outline" className="border-primary/50 hover:bg-primary/10 rounded-xl">
                View All Markets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-violet-500/10 to-blue-600/10 border rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>

            <div className="max-w-3xl mx-auto text-center relative z-10">
              <Badge variant="purple" className="mb-6 px-3 py-1 rounded-full">
                Get Started Today
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-600">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of traders worldwide and experience the future of cryptocurrency trading with NexusX.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button variant="gradient" size="lg" className="rounded-xl">
                    Create Account
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="border-primary/50 hover:bg-primary/10 rounded-xl">
                    Try Demo Account
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
