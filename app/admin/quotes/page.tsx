"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select"
import { Loader2, Trash2 } from "lucide-react"
import { format } from "date-fns"

type Quote = {
  _id: string
  productName?: string
  name: string
  email: string
  phone: string
  message?: string
  status: "new" | "contacted" | "closed"
  createdAt: string
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = React.useState<Quote[]>([])
  const [status, setStatus] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  async function loadQuotes() {
    setLoading(true)
    const params = status ? `?status=${status}` : ""
    const res = await fetch(`/api/admin/quotes${params}`)
    const data = await res.json()
    setQuotes(data)
    setLoading(false)
  }

  React.useEffect(() => {
    loadQuotes()
  }, [status])

  async function updateStatus(id: string, status: Quote["status"]) {
    await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    loadQuotes()
  }

  async function deleteQuote(id: string) {
    if (!confirm("Delete this quote?")) return

    await fetch("/api/admin/quotes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadQuotes()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quote Requests</h1>
          <p className="text-sm text-muted-foreground">
            Customer quote submissions
          </p>
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" />
          Loading quotes
        </div>
      ) : quotes.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No quote requests found
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map((q) => (
            <Card key={q._id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {q.name} — {q.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {q.email} · {q.phone}
                  </p>
                </div>

                <Badge
                  variant={
                    q.status === "new"
                      ? "destructive"
                      : q.status === "contacted"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {q.status}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {q.message && (
                  <p className="text-sm text-muted-foreground">
                    {q.message}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(q.createdAt), "dd MMM yyyy, HH:mm")}
                  </span>

                  <div className="flex gap-2">
                    <Select
                      value={q.status}
                      onValueChange={(value) =>
                        updateStatus(q._id, value as any)
                      }
                    >
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">
                          Contacted
                        </SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteQuote(q._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
