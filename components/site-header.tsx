"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";

/* --------------------------------
   Types
-------------------------------- */
type HeaderConfig = {
  image: string;
  subtitle?: string;
  title?: string;
};

/* --------------------------------
   Config Maps
-------------------------------- */
const PUBLIC_HEADER_CONFIG: Record<string, HeaderConfig> = {
  "/market-sectors": {
    image: "/products/lab-s1.png",
    subtitle: "Solutions Across Key Industries",
  },
  "/services": {
    image: "/products/retail-s3.png",
    subtitle: "Professional Calibration & Support",
  },
  "/why-us": {
    image: "/products/lab-s2.png",
    subtitle: "Trusted Precision Since Day One",
  },
  "/contact-us": {
    image: "/products/retail-s5.png",
    subtitle: "Get In-Touch With Us",
  },
  "/products": {
    image: "/products/retail-s4.png",
    subtitle: "Precision Weighing Solutions",
  },
};

const ADMIN_HEADER_CONFIG: Record<string, HeaderConfig> = {
  "/admin": {
    image: "/products/retail-s1.png",
    title: "Admin Dashboard",
    subtitle: "Platform overview & management",
  },
  "/admin/products": {
    image: "/products/retail-s5.png",
    title: "Products",
    subtitle: "Manage weighing products & variants",
  },
  "/admin/categories": {
    image: "/products/lab-s1.png",
    title: "Categories",
    subtitle: "Organize product classifications",
  },
  "/admin/banners": {
    image: "/products/retail-s1.png",
    title: "Banners",
    subtitle: "Homepage & campaign banners",
  },
  "/admin/orders": {
    image: "/products/retail-s3.png",
    title: "Orders",
    subtitle: "Customer orders & fulfillment",
  },
  "/admin/quotes": {
    image: "/products/lab-s2.png",
    title: "Quotes",
    subtitle: "Customer quotation requests",
  },
  "/admin/analytics": {
    image: "/products/retail-s4.png",
    title: "Analytics",
    subtitle: "Traffic & business insights",
  },
  "/admin/settings": {
    image: "/products/retail-s5.png",
    title: "System Settings",
    subtitle: "Global configuration & controls",
  },
};

/* --------------------------------
   Helpers
-------------------------------- */
const formatSegment = (seg: string) =>
  seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

function resolveAdminConfig(pathname: string): HeaderConfig | null {
  const match = Object.keys(ADMIN_HEADER_CONFIG)
    .sort((a, b) => b.length - a.length)
    .find(route => pathname.startsWith(route));

  return match ? ADMIN_HEADER_CONFIG[match] : null;
}

/* --------------------------------
   Component
-------------------------------- */
export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map(formatSegment);

  const pageTitle =
    segments.length > 0
      ? segments[segments.length - 1]
      : "Precision Weighing Solutions";

  /* -------- Admin Header -------- */
  if (isAdmin) {
    const config =
      resolveAdminConfig(pathname) ?? {
        image: "/products/retail-s5.png",
        title: "Admin Portal",
        subtitle: "System management & configuration",
      };

    return (
      <header className="relative w-full min-h-[120px] md:min-h-[150px] flex items-center overflow-hidden">
        <HeaderBackground image={config.image} alt={config.title ?? "Admin"} />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-3">
          <div className="flex items-center text-sm text-neutral-300">
            <SidebarTrigger />
            <Link
              href="/"
              className="text-sm font-medium text-neutral-300 hover:text-white transition"
            >
              Home
            </Link>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {config.title}
            </h1>
            {config.subtitle && (
              <p className="mt-1 text-sm md:text-base text-neutral-300 max-w-2xl">
                {config.subtitle}
              </p>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* -------- Public Header -------- */
  const normalizedPath = pathname.toLowerCase();

  const config =
    PUBLIC_HEADER_CONFIG[normalizedPath] ?? {
      image: "/products/retail-s5.png",
      subtitle: "Precision solutions built for performance and reliability.",
    };

  return (
    <header className="relative w-full min-h-[120px] md:min-h-[150px] flex items-center overflow-hidden">
      <HeaderBackground image={config.image} alt={pageTitle} />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-4 py-3">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center text-sm text-neutral-300">
          <SidebarTrigger />
          <Link
            href="/"
            className="hover:text-white transition font-medium"
          >
            Home
          </Link>

          {segments.map((seg, i) => (
            <span key={i} className="flex items-center">
              <ChevronRight className="mx-2 h-4 w-4 text-neutral-400" />
              <span
                className={cn(
                  "capitalize",
                  i === segments.length - 1
                    ? "text-white font-semibold"
                    : "text-neutral-300"
                )}
              >
                {seg}
              </span>
            </span>
          ))}
        </nav>

        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {pageTitle}
          </h1>
          {config.subtitle && (
            <p className="mt-2 text-sm md:text-base lg:text-lg text-neutral-200 max-w-2xl">
              {config.subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

/* --------------------------------
   Shared Background Component
-------------------------------- */
function HeaderBackground({
  image,
  alt,
}: {
  image: string;
  alt: string;
}) {
  return (
    <>
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={alt}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
      </div>
    </>
  );
}
