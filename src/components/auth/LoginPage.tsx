"use client"

import { useState, useEffect } from "react"
import { Github, AlertCircle, LayoutGrid, TrendingUp, GitPullRequest, PieChart, Calendar, Activity, GitCommit, BarChart3, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import AppLogo from "../app-logo"
import Link from "next/link"

export default function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const errorCode = searchParams.get("error_code")
    const errorDescription = searchParams.get("error_description")

    if (errorParam || errorCode || errorDescription) {
      let errorMessage = "Authentication failed. Please try again."

      if (errorCode === "unexpected_failure") {
        errorMessage =
          "GitHub authentication failed. This usually means:\n" +
          "1. GitHub OAuth app permissions are incorrect\n" +
          "2. Your GitHub email is not verified\n" +
          "3. Callback URL is misconfigured\n\n" +
          "Check the console for details."
      } else if (errorDescription) {
        errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, " "))
      } else if (errorParam === "no_code") {
        errorMessage = "Authentication was cancelled or failed."
      } else if (errorParam === "auth_failed") {
        errorMessage = "Failed to complete authentication. Please try again."
      }

      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 8000,
        position: "top-center",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FCA5A5",
          maxWidth: "500px",
        },
        icon: <AlertCircle className="w-5 h-5" />,
      })

      setTimeout(() => {
        router.replace("/login")
      }, 1000)
    }
  }, [searchParams, router])

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "read:user user:email repo workflow read:org",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("OAuth initiation error:", error)
        throw error
      }
      toast.loading("Redirecting to GitHub...", {
        duration: 2000,
        position: "top-center",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with GitHub"
      setError(errorMessage)
      setIsLoading(false)

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FCA5A5",
        },
        icon: <AlertCircle className="w-5 h-5" />,
      })
    }
  }

  const benefits = [
    "Real-time GitHub integration",
    "Advanced analytics dashboard",
    "DORA metrics tracking",
    "Exportable reports",
    "Activity heatmaps",
    "Custom date ranges"
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/95 px-8 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href={'/'}>
          <div className="flex items-center">
            <AppLogo />
          </div>
        </Link>
      </nav>

      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-4rem)] py-12 lg:py-8">
          {/* Left Column - Hero Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Developer Analytics Platform</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Ship faster with
                <span className="text-primary"> data-driven </span>
                insights
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Transform your GitHub activity into actionable metrics. Track productivity, optimize workflows, and make informed decisions.
              </p>
            </div>

            {/* Benefits List */}
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div>
                <div className="text-2xl font-bold">500K+</div>
                <div className="text-sm text-muted-foreground">Repositories</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
            <Card className="border-2 shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">Get Started</h2>
                  <p className="text-muted-foreground">
                    Connect your GitHub account to unlock powerful analytics
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-line text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={handleGitHubLogin}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-12 text-base font-semibold gap-2"
                  >
                    <Github className="w-5 h-5" />
                    {isLoading ? "Connecting..." : "Continue with GitHub"}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-auto" />}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground px-4">
                    By continuing, you agree to grant read access to your GitHub repositories. We never access private data without permission.
                  </p>
                </div>


              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}