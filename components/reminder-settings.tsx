"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReminderSettings {
  enabled: boolean
  reminderTime: number // minutes before due date
}

interface ReminderSettingsProps {
  settings: ReminderSettings
  onUpdateSettings: (settings: ReminderSettings) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReminderSettings({ settings, onUpdateSettings, open, onOpenChange }: ReminderSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(settings)

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Reminder Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-reminders" className="text-base">
                Enable Reminders
              </Label>
              <p className="text-sm text-muted-foreground">Get notified before tasks are due</p>
            </div>
            <Switch
              id="enable-reminders"
              checked={localSettings.enabled}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enabled: checked })}
            />
          </div>

          {localSettings.enabled && (
            <div className="grid gap-2">
              <Label htmlFor="reminder-time">Remind me</Label>
              <Select
                value={localSettings.reminderTime.toString()}
                onValueChange={(value) => setLocalSettings({ ...localSettings, reminderTime: Number.parseInt(value) })}
              >
                <SelectTrigger id="reminder-time" className="bg-background border-input">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="120">2 hours before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleSave} className="mt-2">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
