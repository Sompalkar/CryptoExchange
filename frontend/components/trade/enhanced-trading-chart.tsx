"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Settings, CandlestickChart, LineChart, BarChart2, ChevronDown, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TradingChartProps {
  pair: string
}

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * EnhancedTradingChart - Advanced trading chart component with theme support
 *
 * Features:
 * - Multiple timeframe options (1m, 5m, 15m, 1h, 4h, 1d, 1w)
 * - Different chart types (candlestick, line, area)
 * - Technical indicators with easy removal
 * - Dark/light mode support with proper color schemes
 * - Responsive design for all screen sizes
 * - Real-time data simulation
 *
 * @param {string} pair - Trading pair in format "BTC/USDT"
 */
export default function EnhancedTradingChart({ pair }: TradingChartProps) {
  // Chart container reference
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Theme detection
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  // Chart settings state
  const [timeframe, setTimeframe] = useState("1h")
  const [chartType, setChartType] = useState<"candlestick" | "line" | "area">("candlestick")
  const [indicators, setIndicators] = useState<string[]>([])

  // Market data state
  const [currentPrice, setCurrentPrice] = useState(36750.0)
  const [priceChange, setPriceChange] = useState(2.34)
  const [volume24h, setVolume24h] = useState(28900000000)

  // Available timeframes with their display names and data point counts
  const timeframes = [
    { value: "1m", label: "1m", dataPoints: 60 },
    { value: "5m", label: "5m", dataPoints: 60 },
    { value: "15m", label: "15m", dataPoints: 60 },
    { value: "1h", label: "1h", dataPoints: 100 },
    { value: "4h", label: "4h", dataPoints: 100 },
    { value: "1d", label: "1D", dataPoints: 100 },
    { value: "1w", label: "1W", dataPoints: 100 },
  ]

  // Available technical indicators
  const availableIndicators = [
    { value: "ma", label: "MA(20)", color: "#3b82f6" },
    { value: "ema", label: "EMA(20)", color: "#8b5cf6" },
    { value: "bollinger", label: "Bollinger", color: "#f59e0b" },
    { value: "rsi", label: "RSI", color: "#ef4444" },
    { value: "macd", label: "MACD", color: "#10b981" },
    { value: "volume", label: "Volume", color: "#6b7280" },
  ]

  /**
   * Toggle an indicator on/off
   */
  const toggleIndicator = (indicator: string) => {
    setIndicators((prev) => (prev.includes(indicator) ? prev.filter((i) => i !== indicator) : [...prev, indicator]))
  }

  /**
   * Remove an indicator (called when clicking the X on indicator badge)
   */
  const removeIndicator = (indicator: string) => {
    setIndicators((prev) => prev.filter((i) => i !== indicator))
  }

  /**
   * Get theme-appropriate colors
   */
  const getThemeColors = () => {
    if (isDark) {
      return {
        background: "#0a0a0a",
        foreground: "#fafafa",
        muted: "#262626",
        border: "#404040",
        grid: "#262626",
        text: "#a1a1aa",
        green: "#22c55e",
        red: "#ef4444",
        blue: "#3b82f6",
        purple: "#8b5cf6",
        amber: "#f59e0b",
      }
    } else {
      return {
        background: "#ffffff",
        foreground: "#0a0a0a",
        muted: "#f4f4f5",
        border: "#e4e4e7",
        grid: "#f1f5f9",
        text: "#64748b",
        green: "#16a34a",
        red: "#dc2626",
        blue: "#2563eb",
        purple: "#7c3aed",
        amber: "#d97706",
      }
    }
  }

  // Chart rendering effect
  useEffect(() => {
    if (!chartContainerRef.current) return

    const colors = getThemeColors()

    // Generate mock candlestick data based on the selected timeframe
    const generateCandleData = (): CandleData[] => {
      const data: CandleData[] = []

      // Get the selected timeframe configuration
      const timeframeConfig = timeframes.find((t) => t.value === timeframe) || timeframes[3]
      const dataPoints = timeframeConfig.dataPoints

      // Set the time interval based on timeframe
      let timeInterval: number
      switch (timeframe) {
        case "1m":
          timeInterval = 60 * 1000
          break
        case "5m":
          timeInterval = 5 * 60 * 1000
          break
        case "15m":
          timeInterval = 15 * 60 * 1000
          break
        case "1h":
          timeInterval = 60 * 60 * 1000
          break
        case "4h":
          timeInterval = 4 * 60 * 60 * 1000
          break
        case "1d":
          timeInterval = 24 * 60 * 60 * 1000
          break
        case "1w":
          timeInterval = 7 * 24 * 60 * 60 * 1000
          break
        default:
          timeInterval = 60 * 60 * 1000
      }

      // Determine base price based on trading pair
      let basePrice = 36500
      if (pair.includes("ETH")) basePrice = 2480
      else if (pair.includes("SOL")) basePrice = 142
      else if (pair.includes("ADA")) basePrice = 0.48
      else if (pair.includes("DOT")) basePrice = 7.85

      const now = Date.now()

      // Generate candles with appropriate volatility for the timeframe
      let volatilityFactor = 1
      if (timeframe === "1m" || timeframe === "5m") volatilityFactor = 0.5
      if (timeframe === "1d" || timeframe === "1w") volatilityFactor = 2

      for (let i = dataPoints; i >= 0; i--) {
        const time = now - i * timeInterval
        const open = basePrice + (Math.random() - 0.5) * 200 * volatilityFactor
        const volatility = (50 + Math.random() * 100) * volatilityFactor
        const high = open + Math.random() * volatility
        const low = open - Math.random() * volatility
        const close = low + Math.random() * (high - low)
        const volume = (1000000 + Math.random() * 5000000) * volatilityFactor

        data.push({ time, open, high, low, close, volume })
        basePrice = close
      }

      return data
    }

    const candleData = generateCandleData()
    setCurrentPrice(candleData[candleData.length - 1].close)

    // Create canvas for chart
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size with device pixel ratio for crisp rendering
    const rect = chartContainerRef.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = 500 * dpr
    canvas.style.width = rect.width + "px"
    canvas.style.height = "500px"
    ctx.scale(dpr, dpr)

    chartContainerRef.current.innerHTML = ""
    chartContainerRef.current.appendChild(canvas)

    /**
     * Main chart drawing function
     */
    const drawChart = () => {
      if (!ctx) return

      const canvasWidth = rect.width
      const canvasHeight = 500

      // Clear canvas with theme background
      ctx.fillStyle = colors.background
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Calculate price range
      const prices = candleData.flatMap((d) => [d.high, d.low])
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const priceRange = maxPrice - minPrice
      const padding = priceRange * 0.1

      // Chart dimensions
      const chartHeight = canvasHeight - 100 // Leave space for volume
      const chartWidth = canvasWidth - 80 // Leave space for price labels
      const candleWidth = chartWidth / candleData.length

      // Draw grid
      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 0.5

      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = (i / 10) * chartHeight
        ctx.beginPath()
        ctx.moveTo(60, y)
        ctx.lineTo(canvasWidth - 20, y)
        ctx.stroke()

        // Price labels
        const price = maxPrice + padding - (i / 10) * (priceRange + 2 * padding)
        ctx.fillStyle = colors.text
        ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        ctx.textAlign = "right"
        ctx.fillText(price.toFixed(2), 55, y + 4)
      }

      // Vertical grid lines
      const verticalLineCount = Math.min(candleData.length, 8)
      for (let i = 0; i <= verticalLineCount; i++) {
        const x = 60 + (i / verticalLineCount) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, chartHeight)
        ctx.stroke()

        // Time labels
        if (i < verticalLineCount) {
          const dataIndex = Math.floor((i / verticalLineCount) * candleData.length)
          const date = new Date(candleData[dataIndex].time)
          let timeLabel = ""

          // Format time label based on timeframe
          switch (timeframe) {
            case "1m":
            case "5m":
            case "15m":
              timeLabel = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
              break
            case "1h":
            case "4h":
              timeLabel = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`
              break
            case "1d":
              timeLabel = `${date.getMonth() + 1}/${date.getDate()}`
              break
            case "1w":
              timeLabel = `${date.getMonth() + 1}/${date.getDate()}`
              break
          }

          ctx.fillStyle = colors.text
          ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(timeLabel, x, chartHeight + 15)
        }
      }

      // Scale function for Y-axis
      const scaleY = (price: number) => {
        return ((maxPrice + padding - price) / (priceRange + 2 * padding)) * chartHeight
      }

      // Draw based on chart type
      if (chartType === "candlestick") {
        // Draw candlesticks
        candleData.forEach((candle, i) => {
          const x = 60 + i * candleWidth
          const centerX = x + candleWidth / 2

          const openY = scaleY(candle.open)
          const closeY = scaleY(candle.close)
          const highY = scaleY(candle.high)
          const lowY = scaleY(candle.low)

          const isGreen = candle.close > candle.open

          // Draw wick
          ctx.strokeStyle = isGreen ? colors.green : colors.red
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(centerX, highY)
          ctx.lineTo(centerX, lowY)
          ctx.stroke()

          // Draw body
          ctx.fillStyle = isGreen ? colors.green : colors.red
          const bodyHeight = Math.abs(closeY - openY)
          const bodyY = Math.min(openY, closeY)
          const bodyWidth = Math.max(candleWidth * 0.6, 1)

          ctx.fillRect(centerX - bodyWidth / 2, bodyY, bodyWidth, bodyHeight || 1)
        })
      } else if (chartType === "line" || chartType === "area") {
        // Draw line chart
        ctx.beginPath()
        ctx.strokeStyle = colors.purple
        ctx.lineWidth = 2

        // Move to first point
        const firstX = 60 + candleWidth / 2
        const firstY = scaleY(candleData[0].close)
        ctx.moveTo(firstX, firstY)

        // Draw line through all points
        candleData.forEach((candle, i) => {
          const x = 60 + i * candleWidth + candleWidth / 2
          const y = scaleY(candle.close)
          ctx.lineTo(x, y)
        })

        // Stroke the line
        ctx.stroke()

        // For area chart, fill the area below the line
        if (chartType === "area") {
          const lastX = 60 + (candleData.length - 1) * candleWidth + candleWidth / 2
          const lastY = scaleY(candleData[candleData.length - 1].close)

          // Continue path to bottom corners to create a closed shape
          ctx.lineTo(lastX, chartHeight)
          ctx.lineTo(firstX, chartHeight)
          ctx.closePath()

          // Create gradient fill
          const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight)
          gradient.addColorStop(0, colors.purple + "4D") // 30% opacity
          gradient.addColorStop(1, colors.purple + "0D") // 5% opacity
          ctx.fillStyle = gradient
          ctx.fill()
        }
      }

      // Draw volume bars at bottom if volume indicator is enabled
      if (indicators.includes("volume") || chartType === "candlestick") {
        const volumeHeight = 80
        const volumeY = chartHeight + 20
        const maxVolume = Math.max(...candleData.map((d) => d.volume))

        candleData.forEach((candle, i) => {
          const x = 60 + i * candleWidth
          const centerX = x + candleWidth / 2
          const height = (candle.volume / maxVolume) * volumeHeight
          const isGreen = candle.close > candle.open

          ctx.fillStyle = (isGreen ? colors.green : colors.red) + "40" // 25% opacity
          ctx.fillRect(centerX - candleWidth * 0.3, volumeY + volumeHeight - height, candleWidth * 0.6, height)
        })
      }

      // Draw technical indicators
      if (indicators.includes("ma")) {
        drawMovingAverage(ctx, candleData, 20, colors.blue, scaleY, candleWidth)
      }

      if (indicators.includes("ema")) {
        drawEMA(ctx, candleData, 20, colors.purple, scaleY, candleWidth)
      }

      if (indicators.includes("bollinger")) {
        drawBollingerBands(ctx, candleData, 20, 2, colors.amber, scaleY, candleWidth)
      }
    }

    /**
     * Draw Simple Moving Average
     */
    const drawMovingAverage = (
      ctx: CanvasRenderingContext2D,
      data: CandleData[],
      period: number,
      color: string,
      scaleY: (price: number) => number,
      candleWidth: number,
    ) => {
      const maData = []

      for (let i = period - 1; i < data.length; i++) {
        let sum = 0
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close
        }
        maData.push({ index: i, value: sum / period })
      }

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5

      maData.forEach((point, i) => {
        const x = 60 + point.index * candleWidth + candleWidth / 2
        const y = scaleY(point.value)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    /**
     * Draw Exponential Moving Average
     */
    const drawEMA = (
      ctx: CanvasRenderingContext2D,
      data: CandleData[],
      period: number,
      color: string,
      scaleY: (price: number) => number,
      candleWidth: number,
    ) => {
      const multiplier = 2 / (period + 1)
      const emaData = []

      // Start with SMA for first value
      let ema = data.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) / period
      emaData.push({ index: period - 1, value: ema })

      // Calculate EMA for remaining values
      for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema
        emaData.push({ index: i, value: ema })
      }

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5

      emaData.forEach((point, i) => {
        const x = 60 + point.index * candleWidth + candleWidth / 2
        const y = scaleY(point.value)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    /**
     * Draw Bollinger Bands
     */
    const drawBollingerBands = (
      ctx: CanvasRenderingContext2D,
      data: CandleData[],
      period: number,
      stdDevMultiplier: number,
      color: string,
      scaleY: (price: number) => number,
      candleWidth: number,
    ) => {
      const bollingerData = []

      for (let i = period - 1; i < data.length; i++) {
        let sum = 0
        const prices = []

        for (let j = 0; j < period; j++) {
          const price = data[i - j].close
          sum += price
          prices.push(price)
        }

        const ma = sum / period

        // Calculate standard deviation
        let variance = 0
        for (let j = 0; j < prices.length; j++) {
          variance += Math.pow(prices[j] - ma, 2)
        }
        const stdDev = Math.sqrt(variance / period)

        bollingerData.push({
          index: i,
          middle: ma,
          upper: ma + stdDevMultiplier * stdDev,
          lower: ma - stdDevMultiplier * stdDev,
        })
      }

      // Draw bands with transparency
      const bandColor = color + "80" // 50% opacity

      // Upper band
      ctx.beginPath()
      ctx.strokeStyle = bandColor
      ctx.lineWidth = 1
      bollingerData.forEach((point, i) => {
        const x = 60 + point.index * candleWidth + candleWidth / 2
        const y = scaleY(point.upper)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Middle band
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      bollingerData.forEach((point, i) => {
        const x = 60 + point.index * candleWidth + candleWidth / 2
        const y = scaleY(point.middle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Lower band
      ctx.beginPath()
      ctx.strokeStyle = bandColor
      ctx.lineWidth = 1
      bollingerData.forEach((point, i) => {
        const x = 60 + point.index * candleWidth + candleWidth / 2
        const y = scaleY(point.lower)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    drawChart()

    // Handle resize
    const handleResize = () => {
      if (!chartContainerRef.current) return
      const newRect = chartContainerRef.current.getBoundingClientRect()
      canvas.width = newRect.width * dpr
      canvas.height = 500 * dpr
      canvas.style.width = newRect.width + "px"
      canvas.style.height = "500px"
      ctx.scale(dpr, dpr)
      drawChart()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [pair, timeframe, chartType, indicators, isDark])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          {/* Chart Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <Tabs value={timeframe} onValueChange={setTimeframe} className="h-8">
              <TabsList className="h-8 p-0">
                {timeframes.map((tf) => (
                  <TabsTrigger key={tf.value} value={tf.value} className="px-2 h-8 text-xs">
                    {tf.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Chart type selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {chartType === "candlestick" && <CandlestickChart className="h-4 w-4 mr-1" />}
                  {chartType === "line" && <LineChart className="h-4 w-4 mr-1" />}
                  {chartType === "area" && <BarChart2 className="h-4 w-4 mr-1" />}
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                  <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setChartType("candlestick")}>
                  <CandlestickChart className="h-4 w-4 mr-2" />
                  Candlestick
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("line")}>
                  <LineChart className="h-4 w-4 mr-2" />
                  Line
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType("area")}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Area
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Indicators selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Settings className="h-4 w-4 mr-1" />
                  Indicators
                  {indicators.length > 0 && <Badge className="ml-1 h-4 px-1 text-[10px]">{indicators.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {availableIndicators.map((indicator) => (
                  <DropdownMenuItem
                    key={indicator.value}
                    onClick={() => toggleIndicator(indicator.value)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: indicator.color }} />
                      {indicator.label}
                    </div>
                    {indicators.includes(indicator.value) && (
                      <Badge variant="outline" className="ml-2 h-4 px-1">
                        ✓
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Fullscreen button */}
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Active indicators with easy removal */}
        {indicators.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {indicators.map((indicator) => {
              const indicatorInfo = availableIndicators.find((i) => i.value === indicator)
              return (
                <Badge
                  key={indicator}
                  variant="secondary"
                  className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeIndicator(indicator)}
                >
                  <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: indicatorInfo?.color }} />
                  {indicatorInfo?.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1">
        <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />
      </CardContent>
    </Card>
  )
}
