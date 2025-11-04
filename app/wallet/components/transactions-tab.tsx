"use client"

import { useEffect, useState } from "react"
import { fetchTransactions } from "@/services/api/api-wallets"
import Image from "next/image"
import TransactionDetails from "./transaction-details"
import { formatAmountWithDecimals } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

interface Transaction {
  transaction_id: number
  timestamp: string
  metadata: {
    brand_name: string
    description: string
    destination_client_id: string
    destination_wallet_id: string
    destination_wallet_type: string
    is_reversible: string
    payout_method: string
    requester_platform: string
    source_client_id: string
    source_wallet_id: string
    source_wallet_type: string
    transaction_currency: string
    transaction_gross_amount: string
    transaction_net_amount: string
    transaction_status: string
    wallet_transaction_type: string
  }
}

interface TransactionsResponse {
  data: {
    transactions: Transaction[]
  }
}

interface TransactionsTabProps {
  selectedCurrency?: string | null
  currencies?: Record<string, any>
}

export default function TransactionsTab({ selectedCurrency, currencies = {} }: TransactionsTabProps) {
  const { t } = useTranslations()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState(t("wallet.all"))
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const filters = [t("wallet.all"), t("wallet.deposit"), t("wallet.withdraw"), t("wallet.transfer")]

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const data: TransactionsResponse = await fetchTransactions(selectedCurrency || undefined)
        setTransactions(data.data.transactions || [])
      } catch (error) {
        console.error("Error loading transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [selectedCurrency])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return t("wallet.today")
    }

    return date.toLocaleDateString()
  }

  const getTransactionType = (transaction: Transaction) => {
    const walletTransactionType = transaction.metadata.wallet_transaction_type

    if (walletTransactionType === "transfer_cashier_to_wallet") {
      return t("wallet.deposit")
    } else if (walletTransactionType === "transfer_cashier_from_wallet") {
      return t("wallet.withdraw")
    } else if (walletTransactionType === "transfer_between_wallets") {
      return t("wallet.transfer")
    }
  }

  const getTransactionDisplay = (transaction: Transaction) => {
    const type = getTransactionType(transaction)

    const getAmountColor = () => {
      if (type === t("wallet.withdraw")) {
        return "text-error"
      } else if (type === t("wallet.deposit")) {
        return "text-success-text"
      } else if (type === t("wallet.transfer")) {
        return "text-slate-1200"
      }
      return "text-slate-1200"
    }

    switch (type) {
      case t("wallet.deposit"):
        return {
          iconSrc: "/icons/add-icon.png",
          amountColor: getAmountColor(),
          type: t("wallet.deposit"),
        }
      case t("wallet.withdraw"):
        return {
          iconSrc: "/icons/subtract-icon.png",
          amountColor: getAmountColor(),
          type: t("wallet.withdraw"),
        }
      case t("wallet.transfer"):
        return {
          iconSrc: "/icons/transfer-icon.png",
          amountColor: getAmountColor(),
          type: t("wallet.transfer"),
        }
      default:
        return {
          iconSrc: "/icons/add-icon.png",
          amountColor: getAmountColor(),
          type: t("wallet.deposit"),
        }
    }
  }

  const getTransferDestinationText = (transaction: Transaction) => {
    const { source_wallet_type, destination_wallet_type, transaction_currency } = transaction.metadata

    const isSourceP2P = source_wallet_type?.toLowerCase() === "p2p"
    const isDestinationP2P = destination_wallet_type?.toLowerCase() === "p2p"

    const currencyLabel = currencies[transaction_currency]?.label || transaction_currency

    if (isSourceP2P && !isDestinationP2P) {
      return `P2P ${currencyLabel} -> ${currencyLabel} Wallet`
    } else if (!isSourceP2P && isDestinationP2P) {
      return `${currencyLabel} Wallet -> P2P ${currencyLabel}`
    } else if (isSourceP2P && isDestinationP2P) {
      return `P2P ${currencyLabel} -> P2P ${currencyLabel}`
    } else {
      return `${currencyLabel} Wallet`
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeFilter === t("wallet.all")) {
      return true
    }
    return getTransactionType(transaction) === activeFilter
  })

  const groupedTransactions = filteredTransactions.reduce((groups: { [key: string]: Transaction[] }, transaction) => {
    const dateKey = formatDate(transaction.timestamp)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(transaction)
    return groups
  }, {})

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const handleCloseTransactionDetails = () => {
    setSelectedTransaction(null)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="py-0 space-y-6 mx-auto overflow-hidden">
        <div className="hidden gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "black" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`h-8 rounded-full px-4 text-sm font-normal ${
                activeFilter === filter ? "" : "bg-white border-gray-200 hover:bg-gray-50 text-slate-600"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="space-y-6 h-[calc(100vh-16rem)] md:h-[calc(100vh-14rem)] overflow-y-scroll pb-16">
          {Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
            <div key={dateKey} className="space-y-0">
              <h3 className="text-xs font-medium text-grayscale-text-muted">{dateKey}</h3>

              <div className="space-y-0">
                {dateTransactions.map((transaction, index) => {
                  const display = getTransactionDisplay(transaction)
                  const isTransfer = display.type === t("wallet.transfer")

                  return (
                    <div key={transaction.transaction_id} className="relative">
                      <div
                        className="flex items-center justify-between min-h-[72px] py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {display.iconSrc && (
                              <Image
                                src={display.iconSrc || "/placeholder.svg"}
                                alt={`${display.type} icon`}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                                priority={index < 3}
                              />
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="text-slate-1200 text-base font-normal">{display.type}</div>
                            {isTransfer && (
                              <div className="text-xs font-normal text-grayscale-text-muted">
                                {getTransferDestinationText(transaction)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`${display.amountColor} text-base font-normal mr-6`}>
                          {formatAmountWithDecimals(transaction.metadata.transaction_net_amount)}{" "}
                          {transaction.metadata.transaction_currency}
                        </div>
                      </div>

                      <div className="h-px bg-grayscale-200 ml-10" />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {selectedCurrency
                ? t("wallet.noTransactionsForCurrency")
                : activeFilter === t("wallet.all")
                  ? t("wallet.noTransactions")
                  : activeFilter === t("wallet.deposit")
                    ? t("wallet.noDepositTransactions")
                    : activeFilter === t("wallet.withdraw")
                      ? t("wallet.noWithdrawTransactions")
                      : t("wallet.noTransferTransactions")}
            </div>
          )}

          {filteredTransactions.length > 0 && (
            <div className="text-center text-xs font-normal pt-0 text-grayscale-text-placeholder">
              {t("wallet.endOfTransaction")}
            </div>
          )}
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetails transaction={selectedTransaction} onClose={handleCloseTransactionDetails} />
      )}
    </>
  )
}
