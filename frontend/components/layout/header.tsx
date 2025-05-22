"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, X, User, LogOut, Settings, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { motion } from "framer-motion"
import { getCurrentUser, logout } from "@/lib/auth"
import type { User as AuthUser } from "@/types/auth"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: "Markets", href: "/markets" },
    { name: "Trade", href: "/trade/btc-usdt" },
    { name: "Wallet", href: "/wallet" },
    { name: "History", href: "/history" },
  ]

  const handleLogout = async () => {
    await logout()
    setUser(null)
    window.location.href = "/"
  }

  return (
    <header
      className={`bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b shadow-sm" : ""
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold">
              NX
            </div>
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-600">
              NexusX
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex md:gap-x-8"
        >
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname?.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </motion.div>

        {/* Right side buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-lg">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">3</Badge>
          </Button>

          {/* User menu or login buttons */}
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <Dropdown
              trigger={
                <button className="rounded-full">
                  <Avatar
                    src={user.picture}
                    alt={user.name || user.email}
                    fallback={
                      user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"
                    }
                  />
                </button>
              }
              align="right"
              className="w-56"
            >
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar
                  src={user.picture}
                  alt={user.name || user.email}
                  fallback={
                    user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"
                  }
                  size="sm"
                />
                <div className="flex flex-col space-y-1 leading-none">
                  {user.name && <p className="font-medium">{user.name}</p>}
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownSeparator />
              <DropdownItem onClick={() => (window.location.href = "/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownItem>
              <DropdownItem onClick={() => (window.location.href = "/wallet")}>
                <Wallet className="mr-2 h-4 w-4" />
                <span>Wallet</span>
              </DropdownItem>
              <DropdownItem onClick={() => (window.location.href = "/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownItem>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={() => (window.location.href = "/login")}
              >
                Log in
              </Button>
              <Button
                variant="gradient"
                size="sm"
                className="rounded-lg"
                onClick={() => (window.location.href = "/register")}
              >
                Sign up
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </motion.div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-t"
        >
          <div className="space-y-1 px-4 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-xl px-3 py-2 text-base font-medium ${
                  pathname?.startsWith(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  )
}
