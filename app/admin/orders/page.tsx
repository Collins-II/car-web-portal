"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
//import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/date-picker";
import { Loader2 } from "lucide-react";

/* --------------------------------
   Types
-------------------------------- */
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "cancelled";

export type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

/* --------------------------------
   Status Styles
-------------------------------- */
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

/* --------------------------------
   Page
-------------------------------- */
export default function OrdersPage() {
  return <React.Suspense fallback={<p className="p-6 text-muted-foreground">Loading orders...</p>}><OrdersContent /></React.Suspense>;
}

function OrdersContent() {
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (status) params.set("status", status);
      if (q) params.set("q", q);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      setOrders(json.data || []);
      setLoading(false);
    }

    load();
  }, [from, to, status, q]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer orders & fulfillment
          </p>
        </div>
        <DatePicker />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search order #, customer"
            defaultValue={q}
            onBlur={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("q", e.target.value);
              window.history.replaceState(null, "", `?${params}`);
            }}
          />

          <select
            aria-label="select-input"
            defaultValue={status}
            className="border rounded-md px-3 py-2"
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) params.set("status", e.target.value);
              else params.delete("status");
              window.history.replaceState(null, "", `?${params}`);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="font-semibold">Order List</CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="animate-spin mr-2" /> Loading orders
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-t">
                      <td className="px-4 py-3 font-medium">#{o.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div>{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ZMW {o.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLOR[o.status]}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
