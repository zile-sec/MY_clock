// Add this line to make it compatible with static export
export const dynamic = "force-static"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1A1A1A]">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  )
}
