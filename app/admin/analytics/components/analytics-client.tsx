"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/date-picker"
import {
  Loader2,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  RefreshCcw,
  Download,
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

/* -----------------------------
   Types
----------------------------- */
type KPI = {
  revenue: number
  orders: number
  customers: number
  conversionRate: number
}

type TrendPoint = {
  date: string
  revenue: number
  orders: number
}

type StatusBreakdown = {
  status: string
  count: number
}

type TopProduct = {
  name: string
  quantity: number
  revenue: number
}

type AnalyticsResponse = {
  kpis: KPI
  trends: TrendPoint[]
  statusBreakdown: StatusBreakdown[]
  topProducts: TopProduct[]
}

const REFRESH_INTERVAL = 30_000 // 30 seconds

export default function AnalyticsClient() {
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const [data, setData] = React.useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)

  /* -----------------------------
     Data Fetch
  ----------------------------- */
  async function loadAnalytics(showLoader = false) {
    if (showLoader) setLoading(true)

    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)

    const res = await fetch(`/api/admin/analytics?${params.toString()}`)
    const json = await res.json()

    setData(json)
    setLastUpdated(new Date())
    setLoading(false)
  }

  /* Initial + filter change */
  React.useEffect(() => {
    loadAnalytics(true)
  }, [from, to])

  /* -----------------------------
     Real-time polling (smart)
  ----------------------------- */
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadAnalytics(false)
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  /* -----------------------------
     Export CSV
  ----------------------------- */
  function exportCSV() {
    if (!data) return

    const rows = [
      ["Metric", "Value"],
      ["Revenue", data.kpis.revenue],
      ["Orders", data.kpis.orders],
      ["Customers", data.kpis.customers],
      ["Conversion Rate", `${data.kpis.conversionRate}%`],
    ]

    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "analytics-summary.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  /* -----------------------------
     Export PDF
  ----------------------------- */
function exportPDF() {
  if (!data) return

  const doc = new jsPDF()
  doc.text("Analytics Report", 14, 16)

  autoTable(doc, {
    startY: 24,
    head: [["Metric", "Value"]],
    body: [
      ["Revenue", `ZMW ${data.kpis.revenue.toFixed(2)}`],
      ["Orders", data.kpis.orders.toString()],
      ["Customers", data.kpis.customers.toString()],
      ["Conversion Rate", `${data.kpis.conversionRate}%`],
    ],
  })

  autoTable(doc, {
    startY:
      (autoTable as any).previous?.finalY
        ? (autoTable as any).previous.finalY + 10
        : 40,
    head: [["Product", "Units Sold", "Revenue"]],
    body: data.topProducts.map((p) => [
      p.name,
      p.quantity.toString(),
      `ZMW ${p.revenue.toFixed(2)}`,
    ]),
  })

  doc.save("analytics-report.pdf")
}

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading analytics
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        No analytics data available
      </div>
    )
  }

  const { kpis, trends, statusBreakdown, topProducts } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Business performance overview
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <DatePicker />
          <Button variant="outline" size="sm" onClick={() => loadAnalytics(true)}>
            <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Revenue" value={`ZMW ${kpis.revenue.toFixed(2)}`} icon={<DollarSign />} />
        <KpiCard label="Orders" value={kpis.orders} icon={<ShoppingCart />} />
        <KpiCard label="Customers" value={kpis.customers} icon={<Users />} />
        <KpiCard label="Conversion" value={`${kpis.conversionRate.toFixed(1)}%`} icon={<TrendingUp />} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="font-semibold">Revenue & Orders Trend</CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">Order Status Breakdown</CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader className="font-semibold">Top Products</CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-right">Units Sold</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.name} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-right">{p.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ZMW {p.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

/* -----------------------------
   KPI Card
----------------------------- */
function KpiCard({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  )
}
