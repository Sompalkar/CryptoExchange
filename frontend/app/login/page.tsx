import LoginForm from "@/components/auth/login-form"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold">
              NX
            </div>
            <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-600">
              NexusX
            </span>
          </Link>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
        </div>

        <LoginForm />

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
