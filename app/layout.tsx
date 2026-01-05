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
// <CHANGE> Import LoadingIndicator component
import { LoadingIndicator } from "@/components/loading-indicator"

// ... existing code ...

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
            {/* <CHANGE> Replace Loading... text with LoadingIndicator component */}
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingIndicator /></div>}>
              <Main>{children}</Main>
            </Suspense>
          </AlertDialogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
