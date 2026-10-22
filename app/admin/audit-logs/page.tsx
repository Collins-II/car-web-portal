"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface AuditLog {
  _id: string
  actorName?: string
  action: string
  entity: string
  entityId?: string
  createdAt: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [q, setQ] = useState("")

  useEffect(() => {
    load()
  }, [page, q])

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/audit-logs?q=${q}&page=${page}`)
    const data = await res.json()
    setLogs(data.items)
    setPages(data.pagination.pages)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>

        <Input
          placeholder="Search user, action, entity..."
          value={q}
          onChange={(e) => {
            setPage(1)
            setQ(e.target.value)
          }}
          className="sm:max-w-sm"
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.actorName ?? "System"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entityId ?? "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <nav aria-label="Audit log pagination" className="flex items-center justify-end gap-4">
        <button className="rounded border px-3 py-2 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span className="text-sm">Page {page} of {Math.max(1, pages)}</span>
        <button className="rounded border px-3 py-2 disabled:opacity-40" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </nav>
    </div>
  )
}
