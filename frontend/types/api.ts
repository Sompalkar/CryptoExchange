export interface User {
    id: string
    email: string
    username: string
    balance: number
  }
  
  export interface Order {
    id: string
    user_id: string
    pair: string
    type: "LIMIT" | "MARKET" | "STOP"
    side: "BUY" | "SELL"
    price?: number
    amount: number
    status: "OPEN" | "FILLED" | "CANCELLED"
    fee: number
    created_at: string
    updated_at: string
  }
  
  export interface OrderRequest {
    pair: string
    type: "LIMIT" | "MARKET" | "STOP"
    side: "BUY" | "SELL"
    price?: number
    amount: number
    stopPrice?: number
  }
  
  export interface Trade {
    id: string
    order_id: string
    pair: string
    price: number
    amount: number
    fee: number
    timestamp: string
  }
  
  export interface OrderBookEntry {
    price: number
    amount: number
    total?: number
    count?: number
  }
  
  export interface OrderBook {
    asks: OrderBookEntry[]
    bids: OrderBookEntry[]
    timestamp: string
  }
  
  export interface MarketTicker {
    pair: string
    lastPrice: number
    change24h: number
    high24h: number
    low24h: number
    volume24h: number
    timestamp: string
  }
  
  export interface BalanceResponse {
    balances: Record<string, number>
  }
  
  export interface LoginRequest {
    email: string
    password: string
  }
  
  export interface RegisterRequest {
    email: string
    username: string
    password: string
  }
  
  export interface AuthResponse {
    token: string
    user: User
  }
  