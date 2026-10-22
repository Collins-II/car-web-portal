"use client"

import * as React from "react"
import {
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingCart,
  Users,
  BarChart3,
  Settings2,
  LifeBuoy,
  Send,
  Command,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { DatePicker } from "@/components/date-picker"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { Separator } from "./ui/separator"

/* --------------------------------
   Premier Admin Navigation
-------------------------------- */
const adminData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: BarChart3,
    },
    {
      title: "Catalog",
      url: "/admin/products",
      icon: Package,
      items: [
        {
          title: "Products",
          url: "/admin/products",
        },
        {
          title: "Categories",
          url: "/admin/categories",
        },
      ],
    },
    {
      title: "Content",
      url: "/admin/banners",
      icon: ImageIcon,
      items: [
        {
          title: "Hero Section",
          url: "/admin/heros",
        },
        {
          title: "Banners",
          url: "/admin/banners",
        },
        /*{
          title: "Market Sectors",
          url: "/admin/sectors",
        },*/
      ],
    },
    {
      title: "Quotations",
      url: "/admin/quotes",
      icon: ShoppingCart,
      items: [
       /* {
          title: "All Orders",
          url: "/admin/orders",
        },*/
        {
          title: "Quotations",
          url: "/admin/quotes",
        },
      ],
    },
    /*{
      title: "Users",
      url: "/admin/users",
      icon: Users,
      items: [
        {
          title: "Admins",
          url: "/admin/users/admins",
        },
        {
          title: "Customers",
          url: "/admin/users/customers",
        },
      ],
    },*/
    {
      title: "System",
      url: "/admin/settings",
      icon: Settings2,
      items: [
        {
          title: "General Settings",
          url: "/admin/settings",
        },
        {
          title: "Audit Logs",
          url: "/admin/audit-logs",
        },
      ],
    },
  ],
  navSecondary: [
   /* {
      title: "Support",
      url: "/admin/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/admin/feedback",
      icon: Send,
    },*/
  ],
}

/* --------------------------------
   Sidebar Component
-------------------------------- */
export function SidebarLeft(
  props: React.ComponentProps<typeof Sidebar>
) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        {/* Logo */}
        <Link
          href="/"
          className="w-full flex justify-center items-center py-4"
        >
          <Image
            src="/logo/zm_logo.jpeg"
            alt="Premier Scales Admin"
            width={150}
            height={60}
            className="object-contain"
            priority
          />
        </Link>
      <Separator className="h-[12px]" />
        <NavMain items={adminData.navMain} />
      </SidebarHeader>

      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className="mx-0 my-2" />
        <NavSecondary
          items={adminData.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
