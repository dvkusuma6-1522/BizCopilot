import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizCopilot — AI Sales & Inventory Advisor",
  description: "Turn Your Business Data Into Better Decisions. AI-powered sales intelligence, stockout prediction, and inventory advisor for small businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
