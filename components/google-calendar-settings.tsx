"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calendar, Check, X, AlertCircle, ExternalLink, TestTube, Loader2, Shield } from "lucide-react"
import {
  loadGoogleApi,
  signInToGoogle,
  signOutFromGoogle,
  isSignedInToGoogle,
  testGoogleCalendarConnection,
} from "@/services/google-calendar"
import { OAuthVerification } from "./oauth-verification"

// Add this validation function at the top of the file, after the imports
function isValidGoogleClientId(clientId: string | undefined): boolean {
  if (!clientId) return false
  return clientId.endsWith(".apps.googleusercontent.com")
}

interface GoogleCalendarSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSyncEvents: () => Promise<void>
  autoSync: boolean
  onAutoSyncChange: (autoSync: boolean) => void
}

export function GoogleCalendarSettings({
  open,
  onOpenChange,
  onSyncEvents,
  autoSync,
  onAutoSyncChange,
}: GoogleCalendarSettingsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [testInProgress, setTestInProgress] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const [showOAuthVerification, setShowOAuthVerification] = useState(false)

  // Load Google API and check sign-in status
  useEffect(() => {
    async function initGoogleApi() {
      if (open) {
        setIsLoading(true)
        setErrorMessage(null)
        setTestResult(null)

        // Check client ID format first
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!isValidGoogleClientId(clientId)) {
          setErrorMessage(
            "Invalid Google Client ID format. The environment variable NEXT_PUBLIC_GOOGLE_CLIENT_ID appears to be incorrect. It must end with '.apps.googleusercontent.com'.",
          )
          setApiLoaded(false)
          setIsLoading(false)
          return
        }

        try {
          const loaded = await loadGoogleApi()
          setApiLoaded(loaded)

          if (loaded) {
            const signedIn = await isSignedInToGoogle()
            setIsSignedIn(signedIn)
          } else {
            setErrorMessage("Failed to load Google API. Please check your internet connection and try again.")
          }
        } catch (error) {
          console.error("Error initializing Google API:", error)
          setErrorMessage("An error occurred while initializing Google API. Please try again later.")
          setApiLoaded(false)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initGoogleApi()
  }, [open])

  // Handle sign in
  const handleSignIn = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setTestResult(null)

    try {
      const success = await signInToGoogle()
      setIsSignedIn(success)

      if (!success) {
        setErrorMessage("Failed to sign in to Google. Please check your Google account and try again.")
      } else {
        // Automatically run connection test after successful sign-in
        handleTestConnection()

        if (autoSync) {
          handleSyncEvents()
        }
      }
    } catch (error) {
      console.error("Error signing in to Google:", error)
      setErrorMessage("An error occurred during sign-in. Please check your Google account and try again.")
      setIsSignedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setTestResult(null)

    try {
      const success = await signOutFromGoogle()
      setIsSignedIn(!success)

      if (!success) {
        setErrorMessage("Failed to sign out from Google. Please try again.")
      }
    } catch (error) {
      console.error("Error signing out from Google:", error)
      setErrorMessage("An error occurred during sign-out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sync events
  const handleSyncEvents = async () => {
    if (!isSignedIn) return

    setSyncInProgress(true)
    setErrorMessage(null)

    try {
      await onSyncEvents()
    } catch (error) {
      console.error("Error syncing events:", error)
      setErrorMessage("Failed to sync events with Google Calendar. Please try again.")
    } finally {
      setSyncInProgress(false)
    }
  }

  // Handle connection test
  const handleTestConnection = async () => {
    setTestInProgress(true)
    setTestResult(null)
    setErrorMessage(null)

    try {
      const result = await testGoogleCalendarConnection()
      setTestResult(result)

      if (!result.success) {
        setErrorMessage(result.message)
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      setTestResult({
        success: false,
        message: "Connection test failed with an unexpected error",
      })
    } finally {
      setTestInProgress(false)
    }
  }

  // Show client ID for debugging
  const showClientId = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId) {
      const maskedId =
        clientId.substring(0, 12) + "..." + (clientId.length > 30 ? clientId.substring(clientId.length - 30) : "")
      return `Using Client ID: ${maskedId}`
    }
    return "Client ID not found"
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar Integration
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !apiLoaded ? (
              <div className="text-center text-destructive">
                <X className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load Google Calendar API.</p>
                <p className="text-sm text-muted-foreground mt-1">Please check your configuration.</p>

                <Button onClick={() => setShowOAuthVerification(true)} variant="outline" className="mt-4">
                  <Shield className="h-4 w-4 mr-2" />
                  Verify OAuth Settings
                </Button>

                {/* Debug information */}
                <div className="mt-4 p-2 bg-muted/30 rounded text-xs text-left">
                  <p className="font-mono">{showClientId()}</p>
                  <p className="font-mono">Origin: {typeof window !== "undefined" ? window.location.origin : "N/A"}</p>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{errorMessage}</p>
                      <Button
                        onClick={() => setShowOAuthVerification(true)}
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto p-0 text-xs underline"
                      >
                        Check OAuth Configuration
                      </Button>
                    </div>
                  </div>
                )}

                {testResult && (
                  <div
                    className={`p-3 rounded-md flex items-start gap-2 ${
                      testResult.success ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{testResult.message}</p>
                      {testResult.details && testResult.details.calendars && (
                        <div className="mt-2 text-xs">
                          <p>Available calendars:</p>
                          <ul className="list-disc pl-4">
                            {testResult.details.calendars.map((cal: any, index: number) => (
                              <li key={index}>
                                {cal.summary} {cal.primary && "(Primary)"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium">Google Calendar Account</h3>
                    <p className="text-sm text-muted-foreground">
                      {isSignedIn ? "Your account is connected" : "Connect your Google Calendar account"}
                    </p>
                  </div>
                  {isSignedIn ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="h-5 w-5" />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <Button onClick={handleSignIn} variant="outline">
                      Connect
                    </Button>
                  )}
                </div>

                {isSignedIn && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-sync" className="text-base">
                          Auto-sync Events
                        </Label>
                        <p className="text-sm text-muted-foreground">Automatically sync events with Google Calendar</p>
                      </div>
                      <Switch id="auto-sync" checked={autoSync} onCheckedChange={onAutoSyncChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleTestConnection}
                        disabled={testInProgress}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        {testInProgress ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        {testInProgress ? "Testing..." : "Test Connection"}
                      </Button>

                      <Button onClick={handleSyncEvents} disabled={syncInProgress} className="w-full">
                        {syncInProgress ? "Syncing..." : "Sync Now"}
                      </Button>

                      <Button onClick={handleSignOut} variant="outline" className="w-full">
                        Disconnect Account
                      </Button>
                    </div>
                  </>
                )}

                {/* OAuth Verification Button */}
                <div className="border-t pt-4">
                  <Button
                    onClick={() => setShowOAuthVerification(true)}
                    variant="ghost"
                    className="w-full flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Verify OAuth Configuration
                  </Button>
                </div>

                {/* Troubleshooting section */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  >
                    {showTroubleshooting ? "Hide Troubleshooting" : "Show Troubleshooting"}
                  </Button>

                  {showTroubleshooting && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-md text-sm">
                      <h4 className="font-medium mb-2">Quick Troubleshooting:</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Verify your Google Cloud Console project has the Google Calendar API enabled</li>
                        <li>Make sure your OAuth consent screen is properly configured</li>
                        <li>
                          Check that your authorized JavaScript origins include:{" "}
                          <code className="bg-muted px-1 py-0.5 rounded text-xs">
                            {typeof window !== "undefined" ? window.location.origin : "N/A"}
                          </code>
                        </li>
                        <li>Verify your Client ID is correctly set in the environment variables</li>
                        <li>Try clearing your browser cache and cookies</li>
                      </ol>

                      <div className="mt-4">
                        <a
                          href="https://console.cloud.google.com/apis/credentials"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink size={14} />
                          <span>Open Google Cloud Console</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* OAuth Verification Dialog */}
      <OAuthVerification open={showOAuthVerification} onOpenChange={setShowOAuthVerification} />
    </>
  )
}
