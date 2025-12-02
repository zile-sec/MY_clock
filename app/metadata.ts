import type { Metadata } from "next"

// Add this line to make it compatible with static export
export const dynamic = "force-static"

export const baseMetadata: Metadata = {
  title: {
    default: "Minimalist Productivity",
    template: "%s | Minimalist Productivity",
  },
  description: "A minimalist productivity app with task tracking and time management",
  icons: {
    icon: "/favicon.ico",
  },
}
