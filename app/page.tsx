"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { USER } from "@/lib/local-variables"
import type { Advertisement, PaymentMethod } from "@/services/api/api-buy-sell"
import { BuySellAPI } from "@/services/api"
import FilterPopup, { type FilterOptions } from "@/components/buy-sell/filter-popup"
import OrderSidebar from "@/components/buy-sell/order-sidebar"
import MobileFooterNav from "@/components/mobile-footer-nav"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { formatPaymentMethodName } from "@/lib/utils"

export default function BuySellPage() {
    // TODO: Replace these once the currencies are ready
    const CURRENCY_FILTERS = ["USD", "BTC", "LTC", "ETH", "USDT"]
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("sell")
  const [currency, setCurrency] = useState("IDR")
  const [sortBy, setSortBy] = useState("exchange_rate")
  const [adverts, setAdverts] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fromFollowing: false,
  })
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all")
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [selectedAccountCurrency, setSelectedAccountCurrency] = useState("USD")

  const [isOrderSidebarOpen, setIsOrderSidebarOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)

  useEffect(() => {
    fetchAdverts()
  }, [activeTab, currency, sortBy, filterOptions, selectedPaymentMethod, selectedAccountCurrency])

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoadingPaymentMethods(true)
      try {
        const methods = await BuySellAPI.getPaymentMethods()
        setPaymentMethods(methods)
      } catch (error) {
        console.error("Error fetching payment methods:", error)
      } finally {
        setIsLoadingPaymentMethods(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  const fetchAdverts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: BuySellAPI.SearchParams = {
        type: activeTab,
        account_currency: selectedAccountCurrency, 
        currency: currency,
        paymentMethod: selectedPaymentMethod || undefined,
        sortBy: sortBy,
      }

      if (filterOptions.fromFollowing) {
        params.favourites_only = 1
      }

      const data = await BuySellAPI.getAdvertisements(params)
      if (Array.isArray(data)) {
        setAdverts(data)
      } else {
        console.error("API did not return an array:", data)
        setAdverts([])
        setError("Received invalid data format from server")
      }
    } catch (err) {
      console.error("Error fetching adverts:", err)
      setError("Failed to load advertisements. Please try again.")
      setAdverts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdvertiserClick = (userId: number) => {
    router.push(`/advertiser/${userId}`)
  }

  const handleOrderClick = (ad: Advertisement) => {
    setSelectedAd(ad)
    setIsOrderSidebarOpen(true)
    setError(null)
  }

  useEffect(() => {
    if (isFilterPopupOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!(event.target as Element).closest(".filter-dropdown-container")) {
          setIsFilterPopupOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isFilterPopupOpen])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-shrink-0">
        <div className="mb-4 md:mb-6 md:flex md:flex-col justify-between gap-4">
          {
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-[24px]">
                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "buy" | "sell")}>
                  <TabsList className="w-full md:min-w-[230px]">
                    <TabsTrigger className="w-full data-[state=active]:font-bold" value="sell">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger className="w-full data-[state=active]:font-bold" value="buy">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex gap-[8px] flex-wrap">
                  {CURRENCY_FILTERS.map((currencyFilter) => (
                    <Button
                      key={currencyFilter}
                      variant={selectedAccountCurrency === currencyFilter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAccountCurrency(currencyFilter)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedAccountCurrency === currencyFilter
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {currencyFilter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          }
          <div className="flex flex-wrap gap-2 md:gap-3 md:px-0 mt-4 md:mt-0">
            {
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="flex-1 md:flex-none w-auto">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            }
            <div className="md:block">
              <Select
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
                disabled={isLoadingPaymentMethods}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingPaymentMethods ? "Loading..." : "Payment method"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Payment (All)</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.method} value={method.method}>
                      {method.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative filter-dropdown-container flex-shrink-0 flex-1">
              {
                <button
                  onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                  className="h-10 px-3 py-2 md:w-[150px] flex items-center justify-between rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-[#000000] active:border-[#000000] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-sm hidden md:inline">Filter by</span>
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MaTVHgyEEk1geuXl77pbxjPzcQzTkb.png"
                    alt="Dropdown"
                    width={15}
                    height={15}
                    className="h-4 w-4 opacity-70 md:inline"
                  />
                </button>
              }
              {isFilterPopupOpen && (
                <FilterPopup
                  isOpen={isFilterPopupOpen}
                  onClose={() => setIsFilterPopupOpen(false)}
                  onApply={setFilterOptions}
                  initialFilters={filterOptions}
                />
              )}
            </div>
            <div className="hidden md:block">
              <Select defaultValue="exchange_rate" onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exchange_rate">Exchange rate (high-low)</SelectItem>
                  <SelectItem value="user_rating_average">User rating (high-low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
              <p className="mt-2 text-slate-600">Loading ads...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">{error}</div>
          ) : adverts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Image src="/icons/search-icon.png" alt="No ads found" width={56} height={56} className="opacity-60" />
              <p className="text-xl font-medium text-slate-800 mt-[24px]">No ads available.</p>
            </div>
          ) : (
            <>
              <div className="md:block">
                <Table>
                  <TableHeader className="hidden lg:table-header-group border-b sticky top-0 bg-white">
                    <TableRow className="text-sm">
                      <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">Advertisers</TableHead>
                      <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">Rates</TableHead>
                      <TableHead className="text-left py-4 px-4 text-slate-600 hidden sm:table-cell font-normal">
                        Payment methods
                      </TableHead>
                      <TableHead className="text-right py-4 px-4"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-slate-200 font-normal text-sm">
                    {adverts.map((ad) => (
                      <TableRow className="flex flex-col lg:table-row" key={ad.id}>
                        <TableCell className="py-4 px-4 align-top">
                          <div className="flex items-center">
                            <div className="h-[24px] w-[24px] flex-shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm mr-[8px]">
                              {(ad.user?.nickname || "").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleAdvertiserClick(ad.user?.id || 0)}
                                  className="hover:underline cursor-pointer"
                                >
                                  {ad.user?.nickname || "Unknown"}
                                </button>
                                {ad.user?.is_favourite && (
                                  <span className="ml-2 px-[8px] py-[4px] bg-blue-50 text-blue-100 text-xs rounded-[4px]">
                                    Following
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-slate-500">
                                {ad.user_rating_average && (
                                  <span className="flex items-center">
                                    <Image
                                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6OumZ18zNMtAEyxgeIh25pHnlCud1B.png"
                                      alt="Rating"
                                      width={16}
                                      height={16}
                                      className="mr-1"
                                    />
                                    <span className="text-[#FFAD3A]">{ad.user_rating_average.toFixed(2)}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 align-top">
                          <div className="font-bold text-base">
                            {ad.payment_currency}{" "}
                            {ad.exchange_rate
                              ? ad.exchange_rate.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "N/A"}
                          </div>
                          <div className="mt-1">{`Trade Limits: ${ad.account_currency} ${ad.minimum_order_amount || "N/A"} - ${
                            ad.actual_maximum_order_amount || "N/A"
                          }`}</div>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <div className="flex items-center bg-gray-100 rounded-sm px-2 py-1">
                              <Image
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yvSdAuwjE496WbipvfAqwVr5jalzr4.png"
                                alt="Clock"
                                width={12}
                                height={12}
                                className="mr-1"
                              />
                              <span>{ad.order_expiry_period} min</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 sm:table-cell align-top">
                          <div className="flex flex-col flex-wrap gap-2">
                            {ad.payment_methods?.map((method, index) => (
                              <div key={index} className="flex items-center">
                                {method && (
                                  <div
                                    className={`h-2 w-2 rounded-full mr-2 ${
                                      method.toLowerCase().includes("bank") ? "bg-payment-method-bank" : "bg-payment-method-other"
                                    }`}
                                  ></div>
                                )}
                                <span className="text-xs">{formatPaymentMethodName(method)}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-right align-top">
                          {USER.id != ad.user.id && (
                            <Button
                              variant={ad.type === "buy" ? "destructive" : "secondary"}
                              size="sm"
                              onClick={() => handleOrderClick(ad)}
                            >
                              {ad.type === "buy" ? "Sell" : "Buy"} {ad.account_currency}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <MobileFooterNav />
      </div>
      <OrderSidebar
        isOpen={isOrderSidebarOpen}
        onClose={() => setIsOrderSidebarOpen(false)}
        ad={selectedAd}
        orderType={activeTab}
      />
    </div>
  )
}
