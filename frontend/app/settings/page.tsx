"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Shield, Palette, Globe, Download, Trash2, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    trading: boolean
    security: boolean
  }
  privacy: {
    showPortfolio: boolean
    showTrades: boolean
    dataCollection: boolean
  }
  trading: {
    confirmOrders: boolean
    soundEffects: boolean
    advancedMode: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: false,
      trading: true,
      security: true,
    },
    privacy: {
      showPortfolio: false,
      showTrades: false,
      dataCollection: true,
    },
    trading: {
      confirmOrders: true,
      soundEffects: false,
      advancedMode: false,
    },
  })
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // Settings would be loaded from API
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const updateSetting = (category: keyof Settings, key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const exportData = () => {
    // Simulate data export
    console.log("Exporting user data...")
  }

  const deleteAccount = () => {
    // Simulate account deletion
    console.log("Account deletion requested...")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-32 h-6 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="w-48 h-4 bg-muted rounded animate-pulse"></div>
                      <div className="w-12 h-6 bg-muted rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSetting("notifications", "email", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => updateSetting("notifications", "push", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trading-notifications">Trading Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about order fills and price alerts</p>
                </div>
                <Switch
                  id="trading-notifications"
                  checked={settings.notifications.trading}
                  onCheckedChange={(checked) => updateSetting("notifications", "trading", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="security-notifications">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Important security-related notifications</p>
                </div>
                <Switch
                  id="security-notifications"
                  checked={settings.notifications.security}
                  onCheckedChange={(checked) => updateSetting("notifications", "security", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-portfolio">Show Portfolio</Label>
                  <p className="text-sm text-muted-foreground">Make your portfolio visible to others</p>
                </div>
                <Switch
                  id="show-portfolio"
                  checked={settings.privacy.showPortfolio}
                  onCheckedChange={(checked) => updateSetting("privacy", "showPortfolio", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-trades">Show Trading Activity</Label>
                  <p className="text-sm text-muted-foreground">Display your trading activity publicly</p>
                </div>
                <Switch
                  id="show-trades"
                  checked={settings.privacy.showTrades}
                  onCheckedChange={(checked) => updateSetting("privacy", "showTrades", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-collection">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Allow anonymous usage data collection</p>
                </div>
                <Switch
                  id="data-collection"
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) => updateSetting("privacy", "dataCollection", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trading Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Trading Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="confirm-orders">Order Confirmation</Label>
                  <p className="text-sm text-muted-foreground">Require confirmation before placing orders</p>
                </div>
                <Switch
                  id="confirm-orders"
                  checked={settings.trading.confirmOrders}
                  onCheckedChange={(checked) => updateSetting("trading", "confirmOrders", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound-effects">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sounds for trading events</p>
                </div>
                <Switch
                  id="sound-effects"
                  checked={settings.trading.soundEffects}
                  onCheckedChange={(checked) => updateSetting("trading", "soundEffects", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="advanced-mode">Advanced Trading Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable advanced trading features</p>
                </div>
                <Switch
                  id="advanced-mode"
                  checked={settings.trading.advancedMode}
                  onCheckedChange={(checked) => updateSetting("trading", "advancedMode", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Account */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm text-muted-foreground">Download a copy of your account data</div>
                  </div>
                </div>
                <Button variant="outline" onClick={exportData}>
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium text-red-600">Delete Account</div>
                    <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
                  </div>
                </div>
                <Button variant="destructive" onClick={deleteAccount}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
