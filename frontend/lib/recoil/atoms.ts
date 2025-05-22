import { atom } from "recoil"
import type { User } from "@/types/auth"

// Authentication state
export const userState = atom<User | null>({
  key: "userState",
  default: null,
})

// Authentication loading state
export const authLoadingState = atom<boolean>({
  key: "authLoadingState",
  default: true,
})

// Dark mode state
export const darkModeState = atom<boolean>({
  key: "darkModeState",
  default: true,
})

// Selected trading pair state
export const selectedPairState = atom<string>({
  key: "selectedPairState",
  default: "BTC/USDT",
})

// Market data refresh state
export const marketRefreshState = atom<number>({
  key: "marketRefreshState",
  default: 0,
})

// Wallet balance state
export const walletBalanceState = atom<Record<string, number>>({
  key: "walletBalanceState",
  default: {},
})
