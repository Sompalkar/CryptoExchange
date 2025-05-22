"use client"

import { useEffect, useRef } from "react"

interface TradingChartProps {
  pair: string
}

export default function TradingChart({ pair }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // In a real application, you would integrate with a charting library like TradingView
    // or lightweight-charts here. For this example, we'll create a simple canvas chart.

    const canvas = document.createElement("canvas")
    canvas.width = chartContainerRef.current.clientWidth
    canvas.height = 400
    chartContainerRef.current.innerHTML = ""
    chartContainerRef.current.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw a simple candlestick chart
    const drawChart = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set background
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = "#e9ecef"
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let i = 0; i < 5; i++) {
        const y = i * (canvas.height / 4)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let i = 0; i < 7; i++) {
        const x = i * (canvas.width / 6)
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Generate random price data for demonstration
      const basePrice = 36750
      const priceData = []

      for (let i = 0; i < 50; i++) {
        const open = basePrice + Math.random() * 200 - 100
        const close = open + Math.random() * 100 - 50
        const high = Math.max(open, close) + Math.random() * 50
        const low = Math.min(open, close) - Math.random() * 50

        priceData.push({ open, close, high, low })
      }

      // Find min and max prices for scaling
      const allPrices = priceData.flatMap((candle) => [candle.high, candle.low])
      const minPrice = Math.min(...allPrices)
      const maxPrice = Math.max(...allPrices)
      const priceRange = maxPrice - minPrice

      // Draw candlesticks
      const candleWidth = canvas.width / priceData.length

      priceData.forEach((candle, i) => {
        const x = i * candleWidth

        // Scale prices to canvas height
        const scaleY = (price: number) => {
          return canvas.height - ((price - minPrice) / priceRange) * canvas.height
        }

        const openY = scaleY(candle.open)
        const closeY = scaleY(candle.close)
        const highY = scaleY(candle.high)
        const lowY = scaleY(candle.low)

        // Draw wick (high to low line)
        ctx.beginPath()
        ctx.strokeStyle = candle.open > candle.close ? "#ef4444" : "#22c55e"
        ctx.moveTo(x + candleWidth / 2, highY)
        ctx.lineTo(x + candleWidth / 2, lowY)
        ctx.stroke()

        // Draw body (open to close rectangle)
        ctx.fillStyle = candle.open > candle.close ? "#ef4444" : "#22c55e"
        const bodyHeight = Math.abs(closeY - openY)
        const bodyY = Math.min(openY, closeY)

        ctx.fillRect(
          x + candleWidth * 0.2,
          bodyY,
          candleWidth * 0.6,
          bodyHeight || 1, // Ensure at least 1px height
        )
      })

      // Draw price labels
      ctx.fillStyle = "#6b7280"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"

      for (let i = 0; i < 5; i++) {
        const y = i * (canvas.height / 4)
        const price = maxPrice - (i * priceRange) / 4
        ctx.fillText(price.toFixed(2), canvas.width - 5, y + 10)
      }
    }

    drawChart()

    // Handle window resize
    const handleResize = () => {
      if (!chartContainerRef.current) return
      canvas.width = chartContainerRef.current.clientWidth
      drawChart()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [pair])

  return <div ref={chartContainerRef} className="w-full h-[400px]" />
}
