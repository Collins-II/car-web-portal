import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DealerShell } from "@/components/dealer/shell";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Autohaus | Dealer workspace", template: "%s | Autohaus" },
  description: "Your dealership, in the driver's seat. Inventory, customers, sales and insights in one connected workspace.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DealerShell>{children}</DealerShell>
      </body>
    </html>
  );
}
