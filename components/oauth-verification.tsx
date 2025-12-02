"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Settings,
  Globe,
  Key,
  Shield,
} from "lucide-react"

interface OAuthVerificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface VerificationItem {
  id: string
  title: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  action?: string
  link?: string
}

export function OAuthVerification({ open, onOpenChange }: OAuthVerificationProps) {
  const [showClientId, setShowClientId] = useState(false)
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([])
  const [currentOrigin, setCurrentOrigin] = useState("")

  useEffect(() => {
    if (open) {
      setCurrentOrigin(window.location.origin)
      runVerificationChecks()
    }
  }, [open])

  const runVerificationChecks = () => {
    const items: VerificationItem[] = []
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    // 1. Check Client ID format
    if (!clientId) {
      items.push({
        id: "client-id-missing",
        title: "Google Client ID",
        status: "error",
        message: "NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set",
        action: "Add the environment variable in Vercel settings",
      })
    } else if (!clientId.endsWith(".apps.googleusercontent.com")) {
      items.push({
        id: "client-id-format",
        title: "Google Client ID Format",
        status: "error",
        message: "Client ID format is invalid. Must end with '.apps.googleusercontent.com'",
        action: "Check your Google Cloud Console credentials",
      })
    } else {
      items.push({
        id: "client-id-valid",
        title: "Google Client ID",
        status: "success",
        message: "Client ID format is valid",
      })
    }

    // 2. Check current origin
    const origin = window.location.origin
    items.push({
      id: "current-origin",
      title: "Current Application Origin",
      status: "success",
      message: `Running on: ${origin}`,
      action: "This must be added to authorized origins in Google Cloud Console",
    })

    // 3. Check if localhost or production
    if (origin.includes("localhost")) {
      items.push({
        id: "localhost-warning",
        title: "Development Environment",
        status: "warning",
        message: "Running on localhost - ensure http://localhost:3000 is in authorized origins",
      })
    } else if (origin.includes("vercel.app") || origin.includes("netlify.app")) {
      items.push({
        id: "production-env",
        title: "Production Environment",
        status: "success",
        message: "Running on production domain",
        action: "Ensure this exact domain is in authorized origins",
      })
    }

    // 4. Check HTTPS
    if (origin.startsWith("https://") || origin.includes("localhost")) {
      items.push({
        id: "https-check",
        title: "HTTPS Protocol",
        status: "success",
        message: "Using secure protocol (required for OAuth)",
      })
    } else {
      items.push({
        id: "https-error",
        title: "HTTPS Protocol",
        status: "error",
        message: "OAuth requires HTTPS in production",
        action: "Ensure your domain uses HTTPS",
      })
    }

    setVerificationItems(items)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-600 border-green-200"
      case "error":
        return "bg-red-500/10 text-red-600 border-red-200"
      case "warning":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const maskedClientId = clientId
    ? `${clientId.substring(0, 12)}...${clientId.substring(clientId.length - 30)}`
    : "Not set"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Google Cloud Console OAuth Verification
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Current Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Google Client ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {showClientId ? clientId || "Not set" : maskedClientId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowClientId(!showClientId)}>
                    {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {clientId && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(clientId)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Application Origin</p>
                  <p className="text-sm text-muted-foreground font-mono">{currentOrigin}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentOrigin)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verification Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {verificationItems.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm mt-1">{item.message}</p>
                      {item.action && (
                        <p className="text-xs mt-2 opacity-80">
                          <strong>Action:</strong> {item.action}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Google Cloud Console Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Google Cloud Console Setup Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Enable Google Calendar API</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to APIs & Services → Library → Search "Google Calendar API" → Enable
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        window.open("https://console.cloud.google.com/apis/library/calendar.googleapis.com", "_blank")
                      }
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open Calendar API
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Configure OAuth Consent Screen</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up your OAuth consent screen with the Calendar scope
                    </p>
                    <div className="mt-2 space-y-1">
                      <Badge variant="outline" className="text-xs">
                        Scope: https://www.googleapis.com/auth/calendar
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => copyToClipboard("https://www.googleapis.com/auth/calendar")}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Scope
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open("https://console.cloud.google.com/apis/credentials/consent", "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      OAuth Consent Screen
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
                  <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Create OAuth 2.0 Credentials</h4>
                    <p className="text-sm text-muted-foreground">
                      Create Web Application credentials with proper origins
                    </p>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs font-medium">Authorized JavaScript Origins:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {currentOrigin}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentOrigin)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {currentOrigin.includes("localhost") && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-mono">
                              http://localhost:3000
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard("http://localhost:3000")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Credentials Page
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
                  <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Add Test Users (if needed)</h4>
                    <p className="text-sm text-muted-foreground">
                      Add your email as a test user if the app is not published
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open("https://console.cloud.google.com/apis/credentials/consent", "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Add Test Users
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Environment Variables Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Vercel Environment Variables</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm bg-background px-2 py-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
                    <Badge variant={clientId ? "default" : "destructive"}>{clientId ? "Set" : "Missing"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This should be your Google OAuth 2.0 Client ID from Google Cloud Console
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Vercel Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Google Cloud Console
            </Button>
            <Button variant="outline" onClick={() => runVerificationChecks()}>
              Re-run Checks
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
