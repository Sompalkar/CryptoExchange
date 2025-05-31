"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// API request helper with authentication
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token")

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// WebSocket connection helper
export function connectWebSocket(channels: string[], onMessage: (data: any) => void): WebSocket {
  const wsUrl = API_BASE_URL.replace("http", "ws") + "/ws"
  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log("WebSocket connected")
    // Subscribe to channels
    channels.forEach((channel) => {
      ws.send(
        JSON.stringify({
          action: "subscribe",
          channel: channel,
        }),
      )
    })
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error("Error parsing WebSocket message:", error)
    }
  }

  ws.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  ws.onclose = () => {
    console.log("WebSocket disconnected")
  }

  return ws
}
