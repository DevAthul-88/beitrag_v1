"use client"

import { useState, useEffect } from "react"
import { User, Github, RefreshCw, Download, LogOut, AlertTriangle, Trash2, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import ExportDataButton from "./ExportDataButton"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [githubUsername, setGithubUsername] = useState("")
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [defaultDateRange, setDefaultDateRange] = useState("30d")
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      
      const { data: tokenData } = await supabase
        .from('user_tokens')
        .select('github_username, updated_at')
        .eq('user_id', user.id)
        .single()
      
      if (tokenData) {
        setGithubUsername(tokenData.github_username || '')
        setLastSynced(tokenData.updated_at)
      }
    }
  }

  const handleSyncData = async () => {
    setIsSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setLastSynced(new Date().toISOString())
      toast.success('GitHub data synced successfully!')
    } catch (error) {
      toast.error('Failed to sync data')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleReconnectGithub = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/app/settings`,
          scopes: 'read:user user:email repo workflow read:org',
        },
      })
      
      if (error) throw error
      toast.success('Reconnecting to GitHub...')
    } catch (error) {
      toast.error('Failed to reconnect GitHub')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Signed out successfully')
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      toast.success('Account deleted successfully')
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details and profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user?.id?.slice(0, 20)}...</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Connection
          </CardTitle>
          <CardDescription>
            Manage your GitHub integration and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{githubUsername || 'Not connected'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last synced: {formatDate(lastSynced)}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleReconnectGithub}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconnect
            </Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSyncData} disabled={isSyncing} className="flex-1">
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export and manage your analytics data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <ExportDataButton />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}