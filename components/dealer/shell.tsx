"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpRight, Bell, CalendarDays, CarFront, ChartNoAxesCombined, ChevronDown, ChevronRight, CircleHelp, Command, Gauge, LayoutDashboard, Menu, Search, Settings2, Users, UsersRound, Wallet, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { initials, useDealerData } from "@/lib/dealer-store";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Vehicle inventory", href: "/admin/inventory", icon: CarFront },
  { label: "Leads & enquiries", href: "/admin/leads", icon: UsersRound },
  { label: "Sales & transactions", href: "/admin/sales", icon: Wallet },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reports & analytics", href: "/admin/reports", icon: ChartNoAxesCombined },
];

export function DealerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, error } = useDealerData();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [help, setHelp] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if (event.key === "Escape") {
        setSearch("");
        setNotifications(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const page = navigation.find((item) => item.href === pathname)?.label ?? (pathname === "/admin/settings" ? "Settings" : "Management");
  const results = search.trim() ? [
    ...data.vehicles.filter((v) => `${v.name} ${v.stock}`.toLowerCase().includes(search.toLowerCase())).map((v) => ({ title: `${v.year} ${v.name}`, detail: v.stock, href: `/admin/inventory?q=${encodeURIComponent(v.name)}` })),
    ...data.leads.filter((l) => `${l.name} ${l.email}`.toLowerCase().includes(search.toLowerCase())).map((l) => ({ title: l.name, detail: l.email, href: `/admin/customers?q=${encodeURIComponent(l.name)}` })),
  ].slice(0, 6) : [];
  const scheduled = data.appointments.filter((a) => a.status === "Scheduled");
  return (
    <div className="dealer-app">
      {mobile && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobile(false)} />}
      <aside className={`dealer-sidebar ${mobile ? "is-open" : ""}`}>
        <Link href="/" className="dealer-brand" onClick={() => setMobile(false)}><span className="brand-mark"><CarFront size={25} strokeWidth={1.7} /></span><span>autohaus<span className="brand-dot">.</span><small>DEALER WORKSPACE</small></span></Link>
        <Link href="/admin/settings" className="workspace-switch"><span className="workspace-avatar">A</span><span><strong>{data.settings.dealership}</strong><small><i /> Dealer workspace</small></span><ChevronDown size={15} /></Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobile(false)} className={`dealer-nav-item ${pathname === href ? "active" : ""}`}><Icon size={19} /><span>{label}</span>{href === "/admin/leads" && <b>{data.leads.filter((l) => l.stage === "New").length}</b>}{pathname === href && <span className="active-dot" />}</Link>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-promo"><span className="promo-icon"><Gauge size={20} /></span><strong>A better way to drive sales.</strong><p>Your entire dealership.<br />One connected workspace.</p><Link href="/admin/reports">Explore your insights <ArrowUpRight size={15} /></Link></div>
          <Link href="/admin/settings" className={`dealer-nav-item ${pathname === "/admin/settings" ? "active" : ""}`}><Settings2 size={19} />Settings</Link>
          <button className="dealer-nav-item" onClick={() => setHelp(true)}><CircleHelp size={19} />Help & getting started<ArrowUpRight size={14} /></button>
          <Link href="/admin/settings" className="sidebar-profile"><span className="person-avatar dark-avatar">{initials(data.settings.name)}</span><span><strong>{data.settings.name}</strong><small>Dealership administrator</small></span><ChevronRight size={17} /></Link>
        </div>
      </aside>
      <div className="dealer-workspace">
        <header className="dealer-topbar">
          <div className="topbar-breadcrumb"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu size={20} /></button><span className="breadcrumb-root">Workspace</span><ChevronRight size={14} /><strong>{page}</strong></div>
          <div className="topbar-actions">
            <div className="global-search"><Search size={16} /><input ref={searchInput} aria-label="Search vehicles and customers" placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} /><span><Command size={11} /> K</span>
              {search && <div className="search-results"><small>VEHICLES & CUSTOMERS</small>{results.length ? results.map((r) => <button key={`${r.title}-${r.detail}`} onClick={() => { router.push(r.href); setSearch(""); }}><Search size={15} /><span><strong>{r.title}</strong><small>{r.detail}</small></span><ArrowUpRight size={14} /></button>) : <p>No matching records found.</p>}</div>}
            </div>
            <div className="notification-wrap"><button className="icon-button notification-button" aria-label="View notifications" onClick={() => setNotifications(!notifications)}><Bell size={19} />{data.settings.notifications && scheduled.length > 0 && <i />}</button>
              {notifications && <div className="notification-panel"><div className="panel-heading"><strong>Workspace updates</strong><button className="icon-button" aria-label="Close notifications" onClick={() => setNotifications(false)}><X size={16} /></button></div>{data.settings.notifications ? <><p>{scheduled.length} scheduled appointments need your attention.</p><Link href="/admin/appointments" onClick={() => setNotifications(false)}>View appointments <ArrowUpRight size={14} /></Link><p>{data.leads.filter((l) => l.stage === "New").length} new leads are ready for a follow-up.</p><Link href="/admin/leads" onClick={() => setNotifications(false)}>Open lead pipeline <ArrowUpRight size={14} /></Link></> : <p>Workspace notifications are disabled in settings.</p>}</div>}
            </div>
            <span className="topbar-divider" /><Link href="/admin/settings" className="person-avatar header-avatar" aria-label="Profile settings">{initials(data.settings.name)}</Link>
          </div>
        </header>
        {error && <div role="alert" className="storage-error">{error} This workspace is read-only until the storage issue is resolved.</div>}
        <main className="dealer-main">{children}</main>
        <footer className="dealer-footer"><span>&copy; {new Date().getFullYear()} Autohaus. Built for the road ahead.</span><span><i /> Browser demo <span className="footer-separator">|</span> All changes saved locally</span></footer>
      </div>
      <Dialog open={help} onOpenChange={setHelp}><DialogContent className="dealer-dialog"><DialogTitle>Welcome to your dealer workspace</DialogTitle><DialogDescription>This is a fully interactive local demo. Your changes stay in this browser, not on a server.</DialogDescription><div className="help-steps"><p><CarFront size={20} /><span><strong>Build your inventory</strong>Add vehicles, update prices, and manage availability.</span></p><p><UsersRound size={20} /><span><strong>Turn enquiries into relationships</strong>Track customers from first contact through to a completed sale.</span></p><p><CalendarDays size={20} /><span><strong>Keep the day moving</strong>Schedule test drives, consultations, and deliveries.</span></p><p><ArrowDownToLine size={20} /><span><strong>Take your data with you</strong>Export records as CSV. Clearing browser data will remove local changes. No live payments or messages are sent.</span></p></div><button className="primary-button" onClick={() => setHelp(false)}>Let&apos;s get started <ArrowUpRight size={16} /></button></DialogContent></Dialog>
    </div>
  );
}
