"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Shield, Bell, Globe, Camera, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  country: string
  kycStatus: "none" | "pending" | "approved" | "rejected"
  twoFactorEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  avatar?: string
  createdAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockProfile: UserProfile = {
          id: "user123",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "+1234567890",
          country: "United States",
          kycStatus: "approved",
          twoFactorEnabled: true,
          emailVerified: true,
          phoneVerified: false,
          createdAt: "2023-01-15T00:00:00Z",
        }

        setProfile(mockProfile)
        setFormData({
          firstName: mockProfile.firstName,
          lastName: mockProfile.lastName,
          phone: mockProfile.phone || "",
          country: mockProfile.country,
        })
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (profile) {
        setProfile({
          ...profile,
          ...formData,
        })
      }
      setEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-32 h-6 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="w-full h-10 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="container mx-auto py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)}>Edit</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    fallback={`${profile.firstName[0]}${profile.lastName[0]}`}
                    size="lg"
                  />
                  <div>
                    <h3 className="text-lg font-medium">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </div>
                      </div>
                    </div>
                    <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                      {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Password</div>
                      <div className="text-sm text-muted-foreground">Last changed 30 days ago</div>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Login Sessions</div>
                      <div className="text-sm text-muted-foreground">Manage your active sessions</div>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${profile.emailVerified ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {profile.emailVerified ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium">Email Verification</div>
                      <div className="text-sm text-muted-foreground">{profile.email}</div>
                    </div>
                  </div>
                  <Badge variant={profile.emailVerified ? "default" : "destructive"}>
                    {profile.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${profile.phoneVerified ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      {profile.phoneVerified ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium">Phone Verification</div>
                      <div className="text-sm text-muted-foreground">{profile.phone || "No phone number"}</div>
                    </div>
                  </div>
                  <Badge variant={profile.phoneVerified ? "default" : "destructive"}>
                    {profile.phoneVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">KYC Verification</div>
                      <div className="text-sm text-muted-foreground">Identity verification for higher limits</div>
                    </div>
                  </div>
                  <Badge variant={getKycStatusColor(profile.kycStatus)}>
                    {profile.kycStatus.charAt(0).toUpperCase() + profile.kycStatus.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive updates about your account</div>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Language & Region</div>
                      <div className="text-sm text-muted-foreground">English (US)</div>
                    </div>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
