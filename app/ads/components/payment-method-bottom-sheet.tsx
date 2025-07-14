"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from "react-native"
import type { BottomSheet } from "@gorhom/bottom-sheet"

interface PaymentMethod {
  id: string
  name: string
  type: string
}

interface PaymentMethodBottomSheetProps {
  bottomSheetRef: React.Ref<BottomSheet>
  onConfirm?: (selectedPaymentMethods: PaymentMethod[]) => void
  initialPaymentMethods?: PaymentMethod[]
}

const PaymentMethodBottomSheet: React.FC<PaymentMethodBottomSheetProps> = ({
  bottomSheetRef,
  onConfirm,
  initialPaymentMethods = [],
}) => {
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods)

  const handlePaymentMethodSelect = useCallback((paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethods((prevSelected) => {
      const alreadySelected = prevSelected.some((item) => item.id === paymentMethod.id)
      if (alreadySelected) {
        return prevSelected.filter((item) => item.id !== paymentMethod.id)
      } else {
        return [...prevSelected, paymentMethod]
      }
    })
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: PaymentMethod }) => {
      const isSelected = selectedPaymentMethods.some((selectedItem) => selectedItem.id === item.id)

      return (
        <TouchableOpacity
          style={[styles.paymentMethodItem, isSelected && styles.selectedPaymentMethodItem]}
          onPress={() => handlePaymentMethodSelect(item)}
        >
          <Text style={styles.paymentMethodName}>{item.name}</Text>
        </TouchableOpacity>
      )
    },
    [selectedPaymentMethods, handlePaymentMethodSelect],
  )

  const keyExtractor = useCallback((item: PaymentMethod) => item.id, [])

  const handleConfirm = useCallback(() => {
    console.log("Selected payment methods being passed:", selectedPaymentMethods)
    onConfirm?.(selectedPaymentMethods)
    bottomSheetRef.current?.close()
  }, [selectedPaymentMethods, onConfirm, bottomSheetRef])

  const paymentMethods: PaymentMethod[] = [
    { id: "1", name: "Credit Card", type: "card" },
    { id: "2", name: "PayPal", type: "paypal" },
    { id: "3", name: "Google Pay", type: "googlepay" },
    { id: "4", name: "Apple Pay", type: "applepay" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Payment Methods</Text>
      <FlatList data={paymentMethods} renderItem={renderItem} keyExtractor={keyExtractor} style={styles.list} />
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  list: {
    marginBottom: 16,
  },
  paymentMethodItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 8,
  },
  selectedPaymentMethodItem: {
    backgroundColor: "#e0f7fa",
    borderColor: "#26c6da",
  },
  paymentMethodName: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#2196f3",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default PaymentMethodBottomSheet
