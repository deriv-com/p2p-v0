import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Main from "./main"
import "./globals.css"
import { AlertDialogProvider } from "@/contexts/alert-dialog-context"
import { DatadogRumInit } from "@/components/datadog-rum-init"
import { LanguageSync } from "@/lib/i18n/language-sync"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Buy and sell on Deriv P2P to fund your trading account | Deriv",
  description: "Buy and sell on Deriv P2P to fund your trading account | Deriv",
  generator: "v0.dev",
  icons: {
    icon: "/icons/dp2p.svg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DatadogRumInit />
        <Suspense fallback={null}>
          <LanguageSync />
        </Suspense>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AlertDialogProvider>
            <Toaster />
             <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
              <Main>{children}</Main>
            </Suspense>
          </AlertDialogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
