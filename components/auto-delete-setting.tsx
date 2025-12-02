"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AutoDeleteSettingProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function AutoDeleteSetting({ enabled, onToggle }: AutoDeleteSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="auto-delete" className="text-base">
          Auto-delete completed tasks
        </Label>
        <p className="text-sm text-muted-foreground">Automatically remove tasks when they are checked off</p>
      </div>
      <Switch id="auto-delete" checked={enabled} onCheckedChange={onToggle} />
    </div>
  )
}
