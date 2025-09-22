"use client"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface PreviousOrdersSectionProps {
  onBack: () => void
}

export function PreviousOrdersSection({ onBack }: PreviousOrdersSectionProps) {
  const [previousOrdersTab, setPreviousOrdersTab] = useState<"active" | "past">("active")

  const handlePreviousOrdersTabChange = (value: string) => {
    setPreviousOrdersTab(value as "active" | "past")
  }

  const mockPreviousOrders = [
    {
      id: "00000001",
      type: "buy",
      counterparty: "John_doe",
      status: "Pay now",
      send: "150,920.00 IDR",
      receive: "10.00 USD",
      time: "00:00",
    },
    {
      id: "00000002",
      type: "buy",
      counterparty: "Ali2020",
      status: "Pay now",
      send: "390,000.00 IDR",
      receive: "20.00 USD",
      time: "00:00",
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6 px-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 hover:bg-transparent">
          <Image src="/icons/chevron-left.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-xl font-bold">Previous orders</h1>
      </div>

      <div className="px-3 mb-6">
        <Tabs value={previousOrdersTab} onValueChange={handlePreviousOrdersTabChange}>
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start">
            <TabsTrigger
              value="active"
              className="relative bg-transparent border-0 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
            >
              Active orders
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                1
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="relative bg-transparent border-0 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary text-gray-500"
            >
              Past orders
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 px-3">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="text-left py-4 px-4 text-gray-600 font-medium">Order</TableHead>
                <TableHead className="text-left py-4 px-4 text-gray-600 font-medium">Order ID</TableHead>
                <TableHead className="text-left py-4 px-4 text-gray-600 font-medium">Counterparty</TableHead>
                <TableHead className="text-left py-4 px-4 text-gray-600 font-medium">Status</TableHead>
                <TableHead className="text-left py-4 px-4 text-gray-600 font-medium">Send</TableHead>
                <TableHead className="text-left py-4 px-4 text-gray-600 font-medium">Receive</TableHead>
                <TableHead className="text-left py-4 px-4 text-gray-600 font-medium">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPreviousOrders.map((order) => (
                <TableRow key={order.id} className="border-b hover:bg-gray-50">
                  <TableCell className="py-4 px-4">
                    <span className="text-secondary font-medium">Buy</span>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-900">{order.id}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-900">{order.counterparty}</TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-100">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-900">{order.send}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-900">{order.receive}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-900">{order.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 bg-white rounded-lg p-4">
          <iframe
            src={`${process.env.NEXT_PUBLIC_BASE_URL || "https://app.deriv.com"}/cashier/p2p`}
            className="w-full h-96 border-0 rounded-lg"
            title="Previous Orders"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </div>
  )
}
