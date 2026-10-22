import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import AnalyticsClient from "./components/analytics-client"

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" /> Loading analytics
        </div>
      }
    >
      <AnalyticsClient />
    </Suspense>
  )
}
