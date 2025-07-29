"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"
import { API, AUTH } from "@/lib/local-variables"

interface PaymentMethod {
  id: string
  display_name: string
  method: string
  type: string
  fields: Record<string, any>
}

export default function CreateAdPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [showPaymentMethodSelector, setShowPaymentMethodSelector] = useState(false)

  const [formData, setFormData] = useState({
    type: "buy", // buy or sell
    currency: "USD",
    amount: "",
    rate: "",
    minOrder: "",
    maxOrder: "",
    instructions: "",
    paymentMethods: [] as string[],
  })

  useEffect(() => {
    fetchAvailablePaymentMethods()
  }, [])

  const fetchAvailablePaymentMethods = async () => {
    try {
      const url = `${API.baseUrl}/payment-methods`
      const headers = AUTH.getAuthHeader()
      const response = await fetch(url, { headers })

      if (response.ok) {
        const data = await response.json()
        setAvailablePaymentMethods(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        paymentMethods: selectedPaymentMethods,
      }

      const url = `${API.baseUrl}/ads`
      const headers = {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/ads")
      } else {
        console.error("Failed to create ad")
      }
    } catch (error) {
      console.error("Error creating ad:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 p-0 h-auto font-normal text-gray-600 hover:text-black"
        >
          <Image src="/icons/arrow-left-icon.png" alt="Back" width={20} height={20} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create Advertisement</h1>
        <p className="text-gray-600 mt-2">Set up your buy or sell advertisement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image src="/icons/plus_icon.png" alt="Create" width={20} height={20} />
              Ad Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buy" id="buy" />
                  <Label htmlFor="buy">Buy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sell" id="sell" />
                  <Label htmlFor="sell">Sell</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  value={formData.rate}
                  onChange={(e) => handleInputChange("rate", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrder">Min Order</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => handleInputChange("minOrder", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="maxOrder">Max Order</Label>
                <Input
                  id="maxOrder"
                  type="number"
                  value={formData.maxOrder}
                  onChange={(e) => handleInputChange("maxOrder", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                placeholder="Enter payment instructions..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentMethodSelector(true)}
              className="w-full flex items-center gap-2"
            >
              <Image src="/icons/plus_icon.png" alt="Add" width={16} height={16} />
              Add Payment Methods ({selectedPaymentMethods.length}/3)
            </Button>

            {selectedPaymentMethods.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedPaymentMethods.map((methodId) => {
                  const method = availablePaymentMethods.find(m => m.method === methodId)
                  return (
                    <div key={methodId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{method?.display_name || methodId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPaymentMethods(prev => prev.filter(id => id !== methodId))}
                      >
                        <Image src="/icons/close-icon.png" alt="Remove" width={16} height={16} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Create Ad"}
          </Button>
        </div>
      </form>
    </div>
  )
}
