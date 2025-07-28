import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AlertDialogProvider } from "@/contexts/alert-dialog-context"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { ToastContainer } from "@/components/toast-container"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "P2P Trading Platform",
  description: "Peer-to-peer cryptocurrency trading platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <WebSocketProvider>
            <AlertDialogProvider>
              {children}
              <ToastContainer />
            </AlertDialogProvider>
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
