"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { USER } from "@/lib/local-variables"
import type { Advertisement, PaymentMethod } from "@/services/api/api-buy-sell"
import { BuySellAPI } from "@/services/api"
import MarketFilterDropdown from "@/components/market-filter/market-filter-dropdown"
import type { MarketFilterOptions } from "@/components/market-filter/types"
import OrderSidebar from "@/components/buy-sell/order-sidebar"
import MobileFooterNav from "@/components/mobile-footer-nav"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CurrencyFilter } from "@/components/currency-filter"
import { useCurrencyData } from "@/hooks/use-currency-data"
import Image from "next/image"
import { formatPaymentMethodName } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"
import EmptyState from "@/components/empty-state"
import { PaymentMethodsFilter } from "@/components/payment-methods-filter"
import { useMarketFilterStore } from "@/stores/market-filter-store"
import { Alert } from "@/components/ui/alert"

interface TemporaryBanAlertProps {
  reason?: string
  cooldownTimer?: string
}

const TemporaryBanAlert = ({
  reason = "",
  cooldownTimer = "",
}: TemporaryBanAlertProps) => {
  return (
    <Alert variant="warning" className="flex items-start gap-2 mb-6">
      <Image
        src="/icons/warning-icon-new.png"
        alt="Warning"
        height={24}
        width={24}
      />
      <div className="text-sm">
        {`Your account is temporarily restricted due to ${reason}. Some actions will be unavailable until ${cooldownTimer}.`}
      </div>
    </Alert>
  )
}

export default function BuySellPage() {
  // TODO: Replace these once the currencies are ready
  const CURRENCY_FILTERS = ["USD", "BTC", "LTC", "ETH", "USDT"]
  const router = useRouter()

  const {
    activeTab,
    currency,
    sortBy,
    filterOptions,
    selectedPaymentMethods,
    selectedAccountCurrency,
    setActiveTab,
    setCurrency,
    setSortBy,
    setFilterOptions,
    setSelectedPaymentMethods,
    setSelectedAccountCurrency,
  } = useMarketFilterStore()

  const [adverts, setAdverts] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [paymentMethodsInitialized, setPaymentMethodsInitialized] = useState(false)

  const [isOrderSidebarOpen, setIsOrderSidebarOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const isMobile = useIsMobile()

  const { currencies } = useCurrencyData()

  const abortControllerRef = useRef<AbortController | null>(null)

  const hasActiveFilters = filterOptions.fromFollowing !== false || sortBy !== "exchange_rate"

  useEffect(() => {
    if (paymentMethodsInitialized) {
      fetchAdverts()
    }
  }, [
    activeTab,
    currency,
    sortBy,
    filterOptions,
    selectedPaymentMethods,
    selectedAccountCurrency,
    paymentMethodsInitialized,
  ])

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoadingPaymentMethods(true)
      try {
        const methods = await BuySellAPI.getPaymentMethods()
        setPaymentMethods(methods)

        if (selectedPaymentMethods.length === 0) {
          setSelectedPaymentMethods(methods.map((method) => method.method))
        }
        setPaymentMethodsInitialized(true)
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        setPaymentMethodsInitialized(true)
      } finally {
        setIsLoadingPaymentMethods(false)
      }
    }

    fetchPaymentMethods()
  }, [selectedPaymentMethods.length, setSelectedPaymentMethods])

  const fetchAdverts = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)
    setError(null)
    try {
      const params: BuySellAPI.SearchParams = {
        type: activeTab,
        account_currency: selectedAccountCurrency,
        currency: currency,
        paymentMethod: paymentMethods.length === selectedPaymentMethods.length ? [] : selectedPaymentMethods,
        sortBy: sortBy,
      }

      if (filterOptions.fromFollowing) {
        params.favourites_only = 1
      }

      const data = await BuySellAPI.getAdvertisements(params, abortController.signal)

      if (!abortController.signal.aborted) {
        if (Array.isArray(data)) {
          setAdverts(data)
        } else {
          console.error("API did not return an array:", data)
          setAdverts([])
          setError("Received invalid data format from server")
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error("Error fetching adverts:", err)
        setError("Failed to load advertisements. Please try again.")
        setAdverts([])
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
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

  const handleCurrencySelect = (currencyCode: string) => {
    setCurrency(currencyCode)
  }

  const handleFilterApply = (newFilters: MarketFilterOptions, sortByValue?: string) => {
    setFilterOptions(newFilters)
    if (sortByValue) setSortBy(sortByValue)
  }

  const getPaymentMethodsDisplayText = () => {
    if (
      paymentMethods.length === 0 ||
      selectedPaymentMethods.length === 0 ||
      selectedPaymentMethods.length === paymentMethods.length
    ) {
      return "Payment (All)"
    }

    if (selectedPaymentMethods.length === 1) {
      return (
        paymentMethods.find((m) => m.method === selectedPaymentMethods[0])?.display_name || selectedPaymentMethods[0]
      )
    }

    const displayNames = selectedPaymentMethods.map(
      (methodId) => paymentMethods.find((m) => m.method === methodId)?.display_name || methodId,
    )

    return "Payment: " + displayNames.join(", ")
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

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <>
      {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}
      <div className="flex flex-col h-screen overflow-hidden px-[24px]">
        <TemporaryBanAlert />
        <div className="flex-shrink-0">
          <div className="mb-4 md:mb-6 md:flex md:flex-col justify-between gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="w-full flex flex-col-reverse md:flex-row items-start md:items-center gap-[16px] md:gap-[24px]">
                <Tabs
                  className="w-full md:w-[230px] md:min-w-[230px]"
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as "buy" | "sell")}
                >
                  <TabsList className="w-full md:min-w-[230px]">
                    <TabsTrigger className="w-full data-[state=active]:font-bold" value="sell">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger className="w-full data-[state=active]:font-bold" value="buy">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex gap-[8px] flex-nowrap lg:flex-wrap overflow-auto w-full scrollbar-hide">
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

            <div className="flex flex-wrap gap-2 md:gap-3 md:px-0 mt-4 md:mt-0">
              <CurrencyFilter
                currencies={currencies}
                selectedCurrency={currency}
                onCurrencySelect={handleCurrencySelect}
                trigger={
                  <Button
                    variant="outline"
                    className="rounded-md border border-input bg-background font-normal min-h-[32px] h-[32px] lg:min-h-[40px] lg:h-[40px] px-3 hover:bg-transparent focus:border-black"
                  >
                    <span>{currency}</span>
                    <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
                  </Button>
                }
              />

              <div className="flex-1 md:block md:flex-none max-w-[calc(100%-158px)] md:max-w-none">
                <PaymentMethodsFilter
                  paymentMethods={paymentMethods}
                  selectedMethods={selectedPaymentMethods}
                  onSelectionChange={setSelectedPaymentMethods}
                  isLoading={isLoadingPaymentMethods}
                  trigger={
                    <Button
                      variant="outline"
                      className="rounded-md border border-input font-normal w-full min-h-[32px] h-[32px] lg:min-h-[40px] lg:h-[40px] justify-between hover:bg-transparent lg:max-w-[195px] px-3 bg-transparent"
                    >
                      <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
                        {getPaymentMethodsDisplayText()}
                      </span>
                      <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} />
                    </Button>
                  }
                />
              </div>

              <div className="filter-dropdown-container flex-shrink-0 md:flex-1">
                <MarketFilterDropdown
                  activeTab={activeTab}
                  onApply={handleFilterApply}
                  initialFilters={filterOptions}
                  initialSortBy={sortBy}
                  hasActiveFilters={hasActiveFilters}
                  trigger={
                    <Button
                      variant="outline"
                      className="rounded-md border border-input bg-background font-normal min-h-[32px] h-[32px] lg:min-h-[40px] lg:h-[40px] px-3 hover:bg-transparent focus:border-black min-w-fit"
                    >
                      {isMobile ? (
                        <Image src="/icons/filter-icon.png" alt="Filter" width={20} height={20} />
                      ) : (
                        <>
                          <span>Filter by</span>
                          <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
                        </>
                      )}
                    </Button>
                  }
                />
              </div>

              <div className="hidden md:block">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="exchange_rate"
                      className="data-[state=checked]:bg-black data-[state=checked]:text-white focus:bg-gray-50"
                    >
                      {activeTab === "sell" ? (
                        <>Sort by: Exchange rate (low-high)</>
                      ) : (
                        <>Sort by: Exchange rate (high-low)</>
                      )}
                    </SelectItem>
                    <SelectItem
                      value="user_rating_average_lifetime"
                      className="data-[state=checked]:bg-black data-[state=checked]:text-white focus:bg-gray-50"
                    >
                      Sort by: User rating (high-low)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-20 md:pb-4 scrollbar-hide">
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
                <p className="mt-2 text-slate-600">Loading ads...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">{error}</div>
            ) : adverts.length === 0 ? (
              <EmptyState
                title="No ads for this currency"
                description={`Looking to buy or sell ${selectedAccountCurrency}? You can post your own ad for others to respond.`}
                redirectToAds={true}
              />
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
                    <TableBody className="bg-white lg:divide-y lg:divide-slate-200 font-normal text-sm">
                      {adverts.map((ad) => (
                        <TableRow
                          className="grid grid-cols-[1fr_auto] lg:flex flex-col border rounded-sm mb-[16px] lg:table-row lg:border-x-[0] lg:border-t-[0] lg:mb-[0] p-3 lg:p-0"
                          key={ad.id}
                        >
                          <TableCell className="p-2 lg:p-4 align-top row-start-1 col-span-full whitespace-nowrap">
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
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-slate-500 mt-[4px]">
                              {ad.user.rating_average_lifetime && (
                                <span className="flex items-center">
                                  <Image
                                    src="/icons/star-active.png"
                                    alt="Rating"
                                    width={16}
                                    height={16}
                                    className="mr-1"
                                  />
                                  <span className="text-[#FFAD3A]">{ad.user.rating_average_lifetime.toFixed(2)}</span>
                                </span>
                              )}
                              {ad.user.order_count_lifetime > 0 && (
                                <div className="flex flex-row items-center justify-center gap-[8px] mx-[8px]">
                                  <div className="h-1 w-1 rounded-full bg-slate-500"></div>
                                  <span>{ad.user.order_count_lifetime} orders</span>
                                </div>
                              )}
                              {ad.user.completion_average_30day && (
                                <div className="flex flex-row items-center justify-center gap-[8px]">
                                  <div className="h-1 w-1 rounded-full bg-slate-500"></div>
                                  <span>{ad.user.completion_average_30day}% completion</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 lg:p-4 align-top row-start-2 col-span-full">
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
                                <Image src="/icons/clock.png" alt="Time" width={12} height={12} className="mr-1" />
                                <span>{ad.order_expiry_period} min</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-2 lg:p-4 sm:table-cell align-top row-start-3">
                            <div className="flex flex-row lg:flex-col flex-wrap gap-2 h-full">
                              {ad.payment_methods?.map((method, index) => (
                                <div key={index} className="flex items-center">
                                  {method && (
                                    <div
                                      className={`h-2 w-2 rounded-full mr-2 ${
                                        method.toLowerCase().includes("bank")
                                          ? "bg-paymentMethod-bank"
                                          : "bg-paymentMethod-ewallet"
                                      }`}
                                    ></div>
                                  )}
                                  <span className="text-xs">{formatPaymentMethodName(method)}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 lg:p-4 text-right align-top row-start-3 whitespace-nowrap">
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
    </>
  )
}
