"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { isValid } from "date-fns"

/* ---------------------------
   Utils
--------------------------- */
function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseDate(value?: string | null) {
  if (!value) return undefined
  const d = new Date(value)
  return isValid(d) ? d : undefined
}

/* ---------------------------
   Component
--------------------------- */
export function DatePicker() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [date, setDate] = React.useState<Date | undefined>(() =>
    parseDate(searchParams.get("date"))
  )

  /* Sync when URL changes (back/forward/manual edit) */
  React.useEffect(() => {
    const next = parseDate(searchParams.get("date"))
    setDate(next)
  }, [searchParams])

  /* Push state → URL (NO stale reads) */
  const pushDate = React.useCallback(
    (next?: Date) => {
      const params = new URLSearchParams()

      // Preserve unrelated filters
      searchParams.forEach((value, key) => {
        if (key !== "date") params.set(key, value)
      })

      if (next) params.set("date", formatDate(next))

      router.replace(`/admin/orders?${params.toString()}`, {
        scroll: false,
      })
    },
    [router, searchParams]
  )

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent className="space-y-4">
        {/* Quick actions */}
        <div className="flex gap-2 px-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-500/40 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              const today = new Date()
              setDate(today)
              pushDate(today)
            }}
          >
            Today
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-500/40 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              setDate(undefined)
              pushDate(undefined)
            }}
          >
            Clear
          </Button>
        </div>

        {/* Calendar */}
        <div className="flex justify-center px-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              if (!selected) return
              setDate(selected)
              pushDate(selected)
            }}
            className="
              rounded-xl shadow-sm
              [&_[role=gridcell]]:w-[36px]
              [&_[role=gridcell].bg-accent]:bg-red-500
              [&_[role=gridcell].bg-accent]:text-white
            "
          />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
