import type { MetadataRoute } from "next"

// Add this line to make it compatible with static export
export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minimalist Productivity",
    short_name: "MinProd",
    description: "A minimalist productivity app with task tracking and time management",
    start_url: "/",
    display: "standalone",
    background_color: "#1A1A1A",
    theme_color: "#FF9500",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        src: "/favicon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  }
}
