"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, CalendarDays, CarFront, Check, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Fuel, Gauge, LayoutGrid, List, Pencil, Plus, Search, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UsersRound, Wallet, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { exportCsv, initials, localDate, money, updateDealerData, useDealerData, type DealerData, type Vehicle } from "@/lib/dealer-store";
import { Field, RecordForm, type Editor } from "./record-form";

export type Section = "dashboard" | "inventory" | "leads" | "sales" | "appointments" | "customers" | "reports" | "settings";
const titles: Record<Section, [string, string]> = {
  dashboard: ["Dealership overview", "Here's what's happening at your dealership today."],
  inventory: ["Vehicle inventory", "Your showroom, organized. Manage every vehicle from arrival to sale."],
  leads: ["Leads & enquiries", "Build relationships. Move every opportunity a little further."],
  sales: ["Sales & transactions", "Every deal, every detail. A clear view of your sales."],
  appointments: ["Appointments", "Make time for what matters. Keep your dealership moving."],
  customers: ["Customers", "Great experiences start with knowing your customers."],
  reports: ["Reports & analytics", "Less guesswork. More insight into your dealership's performance."],
  settings: ["Workspace settings", "Make Autohaus work for your dealership."],
};
const stages = ["New", "Contacted", "Test drive", "Negotiation", "Won", "Lost"] as const;
const displayDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeLabel = (time: string) => new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function Badge({ value }: { value: string }) {
  const color = ["Available", "Won", "Completed", "Paid"].includes(value) ? "green" : ["Reserved", "Negotiation", "Test drive", "Scheduled"].includes(value) ? "amber" : ["New", "Contacted"].includes(value) ? "blue" : "gray";
  return <span className={`status-badge ${color}`}><i />{value}</span>;
}
function Empty({ title = "No records found", text = "Try another search or add a new record to get started." }: { title?: string; text?: string }) {
  return <div className="empty-state"><Search size={27} /><h3>{title}</h3><p>{text}</p></div>;
}
function PanelHeading({ title, subtitle, href, action = "View all" }: { title: string; subtitle?: string; href?: string; action?: string }) {
  return <div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{href && <Link href={href} className="text-link">{action}<ArrowUpRight size={15} /></Link>}</div>;
}
function VehicleCard({ vehicle, currency, onEdit }: { vehicle: Vehicle; currency: string; onEdit: () => void }) {
  return <button className="vehicle-card" onClick={onEdit}><div className="vehicle-photo"><Image src={vehicle.image} alt={`${vehicle.year} ${vehicle.name}`} fill sizes="(max-width: 600px) 90vw, (max-width: 1200px) 40vw, 25vw" className="vehicle-image" /><Badge value={vehicle.status} /><span className="photo-stock">{vehicle.stock}</span></div><div className="vehicle-info"><small>{vehicle.year} <span>•</span> {vehicle.body}</small><h3>{vehicle.name}</h3><div className="vehicle-specs"><span><Gauge size={13} />{(vehicle.mileage / 1000).toFixed(1)}k km</span><span><Fuel size={13} />{vehicle.fuel}</span><span>{vehicle.transmission === "Automatic" ? "Auto" : "Manual"}</span></div><div className="vehicle-price"><strong>{money(vehicle.price, currency)}</strong><span>View details <ArrowUpRight size={14} /></span></div></div></button>;
}

function RevenueChart({ data, months, setMonths }: { data: DealerData; months: number; setMonths: (value: number) => void }) {
  const now = new Date();
  const chart = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - months + index + 1, 1);
    const prefix = localDate(date).slice(0, 7);
    const sales = data.sales.filter((s) => s.date.startsWith(prefix));
    return { name: date.toLocaleDateString("en-US", { month: "short" }), revenue: sales.reduce((sum, s) => sum + s.amount, 0), sales: sales.length };
  });
  const total = chart.reduce((sum, month) => sum + month.revenue, 0);
  return (
    <section className="dealer-panel revenue-panel">
      <div className="panel-heading">
        <div><h2>Revenue overview</h2><p>A little perspective on your performance</p></div>
        <label className="compact-select">
          <select aria-label="Revenue chart period" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={6}>Last 6 months</option><option value={12}>Last 12 months</option>
          </select>
          <ChevronDown size={13} />
        </label>
      </div>
      <div className="revenue-summary">
        <strong>{money(total, data.settings.currency)}</strong>
        <span><span className="subtle-green"><TrendingUp size={13} /> {chart.reduce((sum, m) => sum + m.sales, 0)} completed deals</span><small>in this period</small></span>
        <div className="chart-legend"><i /> Revenue</div>
      </div>
      <div className="revenue-chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 600, height: 180 }}>
          <AreaChart data={chart} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e59445" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#e59445" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eeefec" strokeDasharray="4 4" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#969b98", fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#969b98", fontSize: 10 }} tickFormatter={(v: number) => `${v / 1000}k`} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e9ece7", fontSize: 12 }} formatter={(value) => [money(Number(value), data.settings.currency), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#df8f42" strokeWidth={2.5} fill="url(#revenueFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function InventorySummary({ data }: { data: DealerData }) {
  const counts = ["Available", "Reserved", "Sold"].map((status) => ({ status, count: data.vehicles.filter((v) => v.status === status).length }));
  const total = data.vehicles.length;
  const available = counts[0].count / (total || 1) * 100;
  const reserved = counts[1].count / (total || 1) * 100;
  return <section className="dealer-panel inventory-summary"><PanelHeading title="Inventory breakdown" subtitle="A snapshot of your showroom" /><div className="inventory-donut" style={{ background: `conic-gradient(#365b44 0% ${available}%, #e7ac67 ${available}% ${available + reserved}%, #e7ece6 ${available + reserved}% 100%)` }} role="img" aria-label={counts.map((c) => `${c.count} ${c.status}`).join(", ")}><div><strong>{total}</strong><span>Total vehicles</span></div></div><div className="inventory-legend">{counts.map((item, i) => <div key={item.status}><span><i className={`legend-dot dot-${i}`} />{item.status}</span><strong>{item.count}<small>{Math.round(item.count / (total || 1) * 100)}%</small></strong></div>)}</div><Link className="inventory-manage" href="/admin/inventory">Manage inventory<ArrowRight size={15} /></Link></section>;
}

export function DealerPortal({ section, initialSearch = "" }: { section: Section; initialSearch?: string }) {
  const { data } = useDealerData();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState(initialSearch);
  const [filter, setFilter] = useState("All");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [months, setMonths] = useState(6);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [date, setDate] = useState(localDate(new Date()));
  const [appointmentScope, setAppointmentScope] = useState("day");
  const [sort, setSort] = useState("newest");
  const currency = data.settings.currency;
  const today = localDate(new Date());
  const month = today.slice(0, 7);
  const previousMonth = localDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)).slice(0, 7);
  const currentSales = data.sales.filter((s) => s.date.startsWith(month));
  const priorSales = data.sales.filter((s) => s.date.startsWith(previousMonth));
  const revenue = currentSales.reduce((sum, s) => sum + s.amount, 0);
  const priorRevenue = priorSales.reduce((sum, s) => sum + s.amount, 0);
  const growth = priorRevenue ? ((revenue - priorRevenue) / priorRevenue * 100) : 0;
  const activeLeads = data.leads.filter((l) => !["Won", "Lost"].includes(l.stage));
  const matches = (value: string) => value.toLowerCase().includes(query.trim().toLowerCase());
  const vehicleName = (id: string) => data.vehicles.find((v) => v.id === id)?.name ?? "Vehicle unavailable";
  const vehicleRows = data.vehicles.filter((v) => `${v.name} ${v.stock} ${v.year}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || v.status === filter)).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : b.added.localeCompare(a.added));
  const visiblePage = Math.min(page, Math.max(1, Math.ceil(vehicleRows.length / 8)));
  const leadRows = data.leads.filter((l) => matches(`${l.name} ${l.email} ${vehicleName(l.vehicleId)}`) && (filter === "All" || l.stage === filter));
  const saleRows = data.sales.filter((s) => matches(`${s.customer} ${vehicleName(s.vehicleId)} ${s.payment}`));
  const customers = Array.from(new Map(data.leads.map((l) => [l.email.toLowerCase(), l])).values()).filter((l) => `${l.name} ${l.email} ${l.phone}`.toLowerCase().includes(query.toLowerCase()));
  const appointmentRows = data.appointments.filter((a) => (appointmentScope === "all" || a.date === date) && matches(`${a.customer} ${vehicleName(a.vehicleId)} ${a.type}`)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const todayAppointments = data.appointments.filter((a) => a.date === today && a.status === "Scheduled").sort((a, b) => a.time.localeCompare(b.time));

  function notify(message: string) { setToast(message); }
  function mutate(update: (current: DealerData) => DealerData, message: string) {
    try { updateDealerData(update); notify(message); } catch (error) { notify(`Error: ${error instanceof Error ? error.message : "Unable to save changes."}`); }
  }
  function changeLeadStage(id: string, value: string) {
    const stage = stages.find((s) => s === value);
    if (!stage || stage === "Won") return;
    mutate((current) => {
      const lead = current.leads.find((l) => l.id === id);
      if (!lead || lead.stage === "Won") throw new Error("This lead has already been closed. Refresh the pipeline to see its current status.");
      if (stage !== "Lost" && current.vehicles.find((v) => v.id === lead.vehicleId)?.status === "Sold") throw new Error("This vehicle has been sold. Edit the lead to choose another vehicle before reopening it.");
      return { ...current, leads: current.leads.map((l) => l.id === id ? { ...l, stage } : l) };
    }, "Lead stage updated.");
  }
  function exportData() {
    if (section === "inventory") exportCsv("autohaus-inventory.csv", [["Stock", "Vehicle", "Year", "Price", "Currency", "Mileage (km)", "Status"], ...vehicleRows.map((v) => [v.stock, v.name, v.year, v.price, currency, v.mileage, v.status])]);
    else if (section === "leads" || section === "customers") exportCsv(`autohaus-${section}.csv`, [["Name", "Email", "Phone", "Vehicle", "Stage", "Source"], ...(section === "leads" ? leadRows : customers).map((l) => [l.name, l.email, l.phone, vehicleName(l.vehicleId), l.stage, l.source])]);
    else if (section === "appointments") exportCsv("autohaus-appointments.csv", [["Customer", "Vehicle", "Date", "Time", "Type", "Status"], ...appointmentRows.map((a) => [a.customer, vehicleName(a.vehicleId), a.date, a.time, a.type, a.status])]);
    else exportCsv("autohaus-sales-report.csv", [["Date", "Customer", "Vehicle", "Amount", "Currency", "Payment"], ...saleRows.map((s) => [s.date, s.customer, vehicleName(s.vehicleId), s.amount, currency, s.payment])]);
    notify("Your CSV export is ready.");
  }
  const primaryAction: Partial<Record<Section, [string, Editor]>> = {
    dashboard: ["Add vehicle", { kind: "vehicle" }], inventory: ["Add vehicle", { kind: "vehicle" }], leads: ["Add lead", { kind: "lead" }],
    customers: ["Add customer", { kind: "lead" }], sales: ["Record sale", { kind: "sale" }], appointments: ["New appointment", { kind: "appointment" }],
  };
  const action = primaryAction[section];
  const toolbar = (placeholder: string, filters?: string[]) => <div className="records-toolbar"><div className="record-search"><Search size={16} /><input aria-label={placeholder} placeholder={placeholder} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} /></div><div className="toolbar-right">{filters && <label className="filter-select"><SlidersHorizontal size={14} /><select aria-label="Filter by status" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>{["All", ...filters].map((f) => <option key={f} value={f}>{f === "All" ? "All statuses" : f}</option>)}</select></label>}{section === "inventory" && <><select className="sort-select" aria-label="Sort vehicles" value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Recently added</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><div className="view-toggle"><button className={layout === "grid" ? "selected" : ""} aria-label="Grid view" onClick={() => setLayout("grid")}><LayoutGrid size={16} /></button><button className={layout === "list" ? "selected" : ""} aria-label="List view" onClick={() => setLayout("list")}><List size={17} /></button></div></>}</div></div>;
  const stats = [
    { label: "Total revenue", value: money(revenue, currency), icon: Wallet, detail: "this month", trend: priorRevenue ? `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%` : "No prior sales", positive: growth >= 0, link: "/admin/sales" },
    { label: "Vehicles in stock", value: String(data.vehicles.filter((v) => v.status !== "Sold").length).padStart(2, "0"), icon: CarFront, detail: `${data.vehicles.filter((v) => v.status === "Available").length} ready for the road`, trend: "In stock", positive: true, link: "/admin/inventory" },
    { label: "Active leads", value: String(activeLeads.length).padStart(2, "0"), icon: UsersRound, detail: `${data.leads.filter((l) => l.stage === "New").length} new enquiries to follow up`, trend: "Pipeline", positive: true, link: "/admin/leads" },
    { label: "Vehicles sold", value: String(currentSales.length).padStart(2, "0"), icon: CircleDollarSign, detail: `${priorSales.length} sold last month`, trend: "This month", positive: true, link: "/admin/sales" },
  ];

  return <div className="portal-content">
    <div className="page-heading"><div><div className="eyebrow">{section === "dashboard" ? <><span className="eyebrow-line" /> YOUR BUSINESS, AT A GLANCE</> : "AUTOHAUS WORKSPACE"}</div><h1>{titles[section][0]}{section === "dashboard" && <span className="heading-dot">.</span>}</h1><p>{titles[section][1]}</p></div><div className="heading-actions">{section !== "settings" && <button className="secondary-button" onClick={exportData}><ArrowDownToLine size={16} />{section === "dashboard" || section === "reports" ? "Export report" : "Export"}</button>}{action && <button className="primary-button" onClick={() => setEditor(action[1])}><Plus size={17} />{action[0]}</button>}</div></div>

    {(section === "dashboard" || section === "reports") && <>
      {section === "dashboard" && <div className="welcome-strip"><div><span className="welcome-icon"><Sparkles size={18} /></span><span><strong>A good day to move forward, {data.settings.name.split(" ")[0]}.</strong><span>You have <b>{todayAppointments.length} appointments</b> on the calendar today. Let&apos;s make them count.</span></span></div><Link href="/admin/appointments">View schedule <ArrowRight size={16} /></Link></div>}
      <div className="stats-grid">{stats.map(({ label, value, icon: Icon, detail, trend, positive, link }) => <Link href={link} key={label} className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} strokeWidth={1.6} /></span></div><strong className="stat-value">{value}</strong><div className="stat-bottom"><span className={`stat-trend ${positive ? "" : "negative"}`}>{label === "Total revenue" && (positive ? <TrendingUp size={12} /> : <ArrowDown size={12} />)}{trend}</span><small>{detail}</small></div></Link>)}</div>
      <div className="chart-grid"><RevenueChart data={data} months={months} setMonths={setMonths} /><InventorySummary data={data} /></div>
    </>}

    {section === "dashboard" && <>
      <section className="recent-inventory"><div className="section-heading"><div><h2>Recently added vehicles <span>{data.vehicles.filter((v) => v.status !== "Sold").length}</span></h2><p>Fresh arrivals. Ready for their next chapter.</p></div><Link className="text-link" href="/admin/inventory">View inventory <ArrowUpRight size={15} /></Link></div><div className="vehicle-grid">{data.vehicles.filter((v) => v.status !== "Sold").sort((a, b) => b.added.localeCompare(a.added)).slice(0, 4).map((v) => <VehicleCard vehicle={v} currency={currency} key={v.id} onEdit={() => setEditor({ kind: "vehicle", record: v })} />)}</div>{!data.vehicles.some((v) => v.status !== "Sold") && <Empty title="Your next chapter starts here" text="Add a vehicle to bring your showroom to life." />}</section>
      <div className="bottom-grid"><section className="dealer-panel leads-preview"><PanelHeading title="Recent enquiries" subtitle="New connections. New possibilities." href="/admin/leads" /><div className="table-scroll"><table><thead><tr><th>Customer</th><th>Interested in</th><th>Status</th><th /></tr></thead><tbody>{data.leads.slice(0, 4).map((l, i) => <tr key={l.id}><td><div className="customer-cell"><span className={`person-avatar avatar-${i % 4}`}>{initials(l.name)}</span><span><strong>{l.name}</strong><small>{l.source}</small></span></div></td><td>{vehicleName(l.vehicleId)}</td><td><Badge value={l.stage} /></td><td><button className="icon-button" aria-label={`Edit ${l.name}`} onClick={() => setEditor({ kind: "lead", record: l })}><ArrowUpRight size={16} /></button></td></tr>)}</tbody></table></div>{!data.leads.length && <Empty />}</section><section className="dealer-panel appointments-preview"><PanelHeading title="Today's appointments" subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} href="/admin/appointments" action="Schedule" /><div className="appointment-list">{todayAppointments.slice(0, 3).map((a, i) => <button className="appointment-item" key={a.id} onClick={() => setEditor({ kind: "appointment", record: a })}><div className={`appointment-time time-${i}`}><strong>{timeLabel(a.time).split(" ")[0]}</strong><small>{timeLabel(a.time).split(" ")[1]}</small></div><span><strong>{a.customer}</strong><small>{a.type} <span>·</span> {vehicleName(a.vehicleId)}</small></span><ChevronRight size={15} /></button>)}{!todayAppointments.length && <Empty title="A little breathing room" text="No appointments scheduled for today." />}</div><Link href="/admin/appointments" className="schedule-link"><Plus size={14} /> Manage your schedule</Link></section></div>
    </>}

    {section === "inventory" && <>
      <div className="inventory-tabs">
        {["All", "Available", "Reserved", "Sold"].map((status) => (
          <button key={status} className={filter === status ? "active" : ""} onClick={() => { setFilter(status); setPage(1); }}>
            {status === "All" ? "All vehicles" : status}
            <span>{data.vehicles.filter((v) => status === "All" || v.status === status).length}</span>
          </button>
        ))}
      </div>
      {toolbar("Search by make, model or stock number...")}
      <div className={layout === "grid" ? "vehicle-grid inventory-grid" : "vehicle-list"}>
        {vehicleRows.slice((visiblePage - 1) * 8, visiblePage * 8).map((v) => (
          <div key={v.id} className="inventory-card-wrap">
            <VehicleCard vehicle={v} currency={currency} onEdit={() => setEditor({ kind: "vehicle", record: v })} />
            <div className="inventory-card-actions">
              <button onClick={() => setEditor({ kind: "vehicle", record: v })}><Pencil size={14} />Edit vehicle</button>
              {v.status !== "Sold" && <button onClick={() => setEditor({ kind: "sale", vehicleId: v.id })}><CircleDollarSign size={14} />Record sale</button>}
              <button className="delete-action" aria-label={`Delete ${v.name}`} onClick={() => setDeleteTarget(v)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {!vehicleRows.length && <Empty />}
      <div className="pagination">
        <span>{vehicleRows.length} vehicles{query && <> matching &ldquo;{query}&rdquo; <button onClick={() => { setQuery(""); setPage(1); }}>Clear</button></>}</span>
        <div>
          <button disabled={visiblePage === 1} onClick={() => setPage(visiblePage - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
          <span>Page {visiblePage} of {Math.max(1, Math.ceil(vehicleRows.length / 8))}</span>
          <button disabled={visiblePage * 8 >= vehicleRows.length} onClick={() => setPage(visiblePage + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
        </div>
      </div>
    </>}

    {section === "leads" && <>
      <div className="pipeline-summary">
        {stages.map((stage) => <button className={filter === stage ? "active" : ""} key={stage} onClick={() => setFilter(filter === stage ? "All" : stage)}><span>{stage}</span><strong>{data.leads.filter((l) => l.stage === stage).length}</strong></button>)}
      </div>
      <section className="dealer-panel">
        {toolbar("Search customers or vehicles...", [...stages])}
        <div className="table-scroll">
          <table>
            <thead><tr><th>Customer</th><th>Vehicle of interest</th><th>Source</th><th>Pipeline stage</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {leadRows.map((l, i) => <tr key={l.id}>
                <td><div className="customer-cell"><span className={`person-avatar avatar-${i % 4}`}>{initials(l.name)}</span><span><strong>{l.name}</strong><small>{l.email}</small></span></div></td>
                <td>{vehicleName(l.vehicleId)}</td><td>{l.source}</td>
                <td>
                  <select className="stage-select" aria-label={`Stage for ${l.name}`} value={l.stage} disabled={l.stage === "Won"} onChange={(e) => changeLeadStage(l.id, e.target.value)}>
                    {stages.map((s) => <option key={s} value={s} disabled={s === "Won"}>{s}</option>)}
                  </select>
                </td>
                <td>{displayDate(l.created)}</td>
                <td><div className="table-actions">
                  <button className="icon-button" aria-label={`Edit ${l.name}`} onClick={() => setEditor({ kind: "lead", record: l })}><Pencil size={15} /></button>
                  {!["Won", "Lost"].includes(l.stage) && <button className="small-button" onClick={() => setEditor({ kind: "sale", vehicleId: l.vehicleId, customer: l.name })}>Record sale<ArrowUpRight size={13} /></button>}
                </div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!leadRows.length && <Empty />}
        <div className="table-note">{leadRows.length} enquiries <span>Record a sale to mark a lead as won.</span></div>
      </section>
    </>}

    {section === "sales" && <>
      <div className="mini-stats">
        <div><span>Total sales revenue</span><strong>{money(data.sales.reduce((sum, s) => sum + s.amount, 0), currency)}</strong></div>
        <div><span>Completed transactions</span><strong>{data.sales.length}</strong></div>
        <div><span>Average deal value</span><strong>{money(data.sales.length ? data.sales.reduce((sum, s) => sum + s.amount, 0) / data.sales.length : 0, currency)}</strong></div>
      </div>
      <section className="dealer-panel">
        {toolbar("Search transactions...")}
        <div className="table-scroll">
          <table>
            <thead><tr><th>Transaction</th><th>Vehicle</th><th>Customer</th><th>Sale date</th><th>Payment</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {saleRows.map((s) => <tr key={s.id}>
                <td><span className="transaction-id">#AH-{s.id.slice(0, 8).toUpperCase()}</span></td>
                <td><strong>{vehicleName(s.vehicleId)}</strong></td><td>{s.customer}</td>
                <td>{displayDate(s.date)}</td><td>{s.payment}</td>
                <td><strong>{money(s.amount, currency)}</strong></td><td><Badge value="Paid" /></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!saleRows.length && <Empty />}
        <div className="table-note">{saleRows.length} completed sales <span>Demo records only. No payments are processed.</span></div>
      </section>
    </>}

    {section === "appointments" && <section className="dealer-panel"><div className="schedule-toolbar"><div className="schedule-date"><CalendarDays size={19} /><input aria-label="Appointment date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div><div className="inventory-tabs compact-tabs"><button className={appointmentScope === "day" ? "active" : ""} onClick={() => setAppointmentScope("day")}>Selected day</button><button className={appointmentScope === "all" ? "active" : ""} onClick={() => setAppointmentScope("all")}>All appointments</button></div></div>{toolbar("Search appointments...")}<div className="table-scroll"><table><thead><tr><th>Time & date</th><th>Customer</th><th>Vehicle</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody>{appointmentRows.map((a) => <tr key={a.id}><td><div className="stacked-cell"><strong>{timeLabel(a.time)}</strong><small>{displayDate(a.date)}</small></div></td><td><strong>{a.customer}</strong></td><td>{vehicleName(a.vehicleId)}</td><td>{a.type}</td><td><Badge value={a.status} /></td><td><div className="table-actions">{a.status === "Scheduled" && <><button className="icon-button" aria-label={`Edit appointment for ${a.customer}`} onClick={() => setEditor({ kind: "appointment", record: a })}><Pencil size={15} /></button><button className="icon-button" aria-label={`Complete appointment for ${a.customer}`} onClick={() => mutate((d) => ({ ...d, appointments: d.appointments.map((item) => item.id === a.id ? { ...item, status: "Completed" } : item) }), "Appointment marked complete.")}><Check size={17} /></button><button className="icon-button delete-action" aria-label={`Cancel appointment for ${a.customer}`} onClick={() => mutate((d) => ({ ...d, appointments: d.appointments.map((item) => item.id === a.id ? { ...item, status: "Cancelled" } : item) }), "Appointment cancelled.")}><X size={16} /></button></>}</div></td></tr>)}</tbody></table></div>{!appointmentRows.length && <Empty title="Nothing on the calendar" text="Schedule a test drive, delivery or consultation to get started." />}</section>}

    {section === "customers" && <section className="dealer-panel">{toolbar("Search by name, email or phone...")}<div className="table-scroll"><table><thead><tr><th>Customer</th><th>Phone</th><th>Interested in</th><th>Relationship</th><th>Customer since</th><th /></tr></thead><tbody>{customers.map((l, i) => <tr key={l.email}><td><div className="customer-cell"><span className={`person-avatar avatar-${i % 4}`}>{initials(l.name)}</span><span><strong>{l.name}</strong><a href={`mailto:${l.email}`}>{l.email}</a></span></div></td><td><a href={`tel:${l.phone}`}>{l.phone}</a></td><td>{vehicleName(l.vehicleId)}</td><td><Badge value={l.stage === "Won" ? "Won" : l.stage} /></td><td>{displayDate(l.created)}</td><td><button className="icon-button" aria-label={`Edit ${l.name}`} onClick={() => setEditor({ kind: "lead", record: l })}><Pencil size={15} /></button></td></tr>)}</tbody></table></div>{!customers.length && <Empty />}<div className="table-note">{customers.length} unique customers <span>Customer records are linked to your lead pipeline.</span></div></section>}

    {section === "reports" && <div className="reports-grid"><section className="dealer-panel"><PanelHeading title="Lead sources" subtitle="Understand where your customers find you" /><div className="source-bars">{["Website", "Walk-in", "Referral", "Social media"].map((source) => { const count = data.leads.filter((l) => l.source === source).length; return <div key={source}><div><span>{source}</span><strong>{count} leads</strong></div><div className="bar-track"><span style={{ width: `${count / (data.leads.length || 1) * 100}%` }} /></div></div>; })}</div></section><section className="dealer-panel"><PanelHeading title="Sales snapshot" subtitle="Based on all completed transactions" /><div className="report-metrics"><div><span>Lead conversion</span><strong>{Math.round(data.leads.filter((l) => l.stage === "Won").length / (data.leads.length || 1) * 100)}%</strong></div><div><span>Inventory asking value (unsold)</span><strong>{money(data.vehicles.filter((v) => v.status !== "Sold").reduce((sum, v) => sum + v.price, 0), currency)}</strong></div><div><span>Total realized revenue</span><strong>{money(data.sales.reduce((sum, s) => sum + s.amount, 0), currency)}</strong></div></div></section></div>}

    {section === "settings" && <Settings data={data} notify={notify} />}
    {editor && <RecordForm key={`${editor.kind}-${"record" in editor ? editor.record?.id ?? "new" : "new"}`} editor={editor} data={data} onClose={() => setEditor(null)} onSaved={notify} />}
    <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}><DialogContent className="dealer-dialog"><DialogTitle>Delete this vehicle?</DialogTitle><DialogDescription>{deleteTarget?.name} will be removed from your local inventory. Vehicles linked to leads, appointments, or sales cannot be deleted.</DialogDescription><div className="dialog-actions"><button className="secondary-button" onClick={() => setDeleteTarget(null)}>Keep vehicle</button><button className="danger-button" onClick={() => { if (!deleteTarget) return; mutate((d) => { if (d.leads.some((l) => l.vehicleId === deleteTarget.id) || d.appointments.some((a) => a.vehicleId === deleteTarget.id) || d.sales.some((s) => s.vehicleId === deleteTarget.id)) throw new Error("This vehicle has linked records. Keep it in inventory to preserve your dealership history."); return { ...d, vehicles: d.vehicles.filter((v) => v.id !== deleteTarget.id) }; }, "Vehicle deleted."); setDeleteTarget(null); }}>Delete vehicle</button></div></DialogContent></Dialog>
    {toast && <div className={`dealer-toast ${toast.startsWith("Error:") ? "error-toast" : ""}`} role="status">{toast.startsWith("Error:") ? <X size={18} /> : <Check size={18} />}<span>{toast}</span><button className="icon-button" aria-label="Dismiss message" onClick={() => setToast("")}><X size={15} /></button></div>}
  </div>;
}

function Settings({ data, notify }: { data: DealerData; notify: (message: string) => void }) {
  const [currencyChanged, setCurrencyChanged] = useState(false);
  return <div className="settings-layout"><section className="dealer-panel settings-panel"><PanelHeading title="Dealership details" subtitle="The details behind your workspace" /><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const text = (key: string) => String(form.get(key) ?? "").trim(); try { updateDealerData((current) => ({ ...current, settings: { dealership: text("dealership"), name: text("name"), email: text("email"), phone: text("phone"), currency: current.settings.currency, address: text("address"), notifications: form.get("notifications") === "on" } })); notify("Workspace settings saved."); } catch (error) { notify(`Error: ${error instanceof Error ? error.message : "Unable to save settings."}`); } }}><div className="record-fields"><Field label="Dealership name" name="dealership" value={data.settings.dealership} /><Field label="Your name" name="name" value={data.settings.name} /><Field label="Email address" name="email" type="email" value={data.settings.email} /><Field label="Phone number" name="phone" type="tel" value={data.settings.phone} /><div className="full-width"><Field label="Dealership address" name="address" value={data.settings.address} /></div><label className="form-field"><span>Workspace currency</span><select aria-label="Workspace currency" value={data.settings.currency} onChange={() => setCurrencyChanged(true)}><option value={data.settings.currency}>{data.settings.currency} — fixed for this demo dataset</option><option value="change">About changing currency...</option></select></label></div><label className="notification-setting"><span><strong>Workspace notifications</strong><small>Show reminders for scheduled appointments and new leads.</small></span><input name="notifications" type="checkbox" defaultChecked={data.settings.notifications} /></label><div className="dialog-actions"><button type="submit" className="primary-button"><Check size={16} />Save changes</button></div></form></section><aside className="settings-aside"><span className="local-badge"><span /> LOCAL DEMO WORKSPACE</span><h3>Your data. Your browser.</h3><p>All records are saved on this device. No external database, email service, payment processor, or authentication is connected.</p><p>Use CSV exports to keep a copy of your records. This demo is not intended for real customer information or multi-user operations.</p><div><Clock3 size={17} /><span>Changes persist when you refresh or return using the same browser.</span></div></aside><Dialog open={currencyChanged} onOpenChange={setCurrencyChanged}><DialogContent className="dealer-dialog"><DialogTitle>Currency belongs to your dataset</DialogTitle><DialogDescription>These demo records are denominated in {data.settings.currency}. Relabelling them would misrepresent their value. A production setup should configure its base currency before importing inventory and transactions, or use verified exchange rates.</DialogDescription><button className="primary-button" onClick={() => setCurrencyChanged(false)}>Understood</button></DialogContent></Dialog></div>;
}
