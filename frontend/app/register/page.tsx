"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle, Mail, Lock, User, ArrowRight, Check } from "lucide-react"
// import { register } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (!name || !email || !password) {
        throw new Error("Please fill in all fields")
      }

      await register(name, email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setLoading(true)
    // Simulate Google login
    setTimeout(() => {
      register("Google User", "user@example.com", "password").then(() => {
        router.push("/dashboard")
      })
    }, 1500)
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const passwordStrength = getPasswordStrength()
  const strengthText = ["Weak", "Fair", "Good", "Strong"]
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0.2, x: 50 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0.2, x: -50 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.5 }}
          className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"
        ></motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold">
              NX
            </div>
            <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-600">
              NexusX
            </span>
          </Link>
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">Join thousands of traders on NexusX</p>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm p-6">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 flex items-center mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Password strength:</span>
                    <span className="text-xs font-medium">
                      {passwordStrength > 0 ? strengthText[passwordStrength - 1] : "Too weak"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength > 0 ? strengthColor[passwordStrength - 1] : "bg-muted-foreground"}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center text-xs">
                      <div
                        className={`w-3 h-3 rounded-full mr-1 flex items-center justify-center ${password.length >= 8 ? "bg-green-500" : "bg-muted"}`}
                      >
                        {password.length >= 8 && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div
                        className={`w-3 h-3 rounded-full mr-1 flex items-center justify-center ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-muted"}`}
                      >
                        {/[A-Z]/.test(password) && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div
                        className={`w-3 h-3 rounded-full mr-1 flex items-center justify-center ${/[0-9]/.test(password) ? "bg-green-500" : "bg-muted"}`}
                      >
                        {/[0-9]/.test(password) && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span>Number</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div
                        className={`w-3 h-3 rounded-full mr-1 flex items-center justify-center ${/[^A-Za-z0-9]/.test(password) ? "bg-green-500" : "bg-muted"}`}
                      >
                        {/[^A-Za-z0-9]/.test(password) && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full rounded-xl"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowRight className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </motion.div>
    </div>
  )
}
