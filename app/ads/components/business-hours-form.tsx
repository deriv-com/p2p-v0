"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useUserDataStore } from "@/stores/user-data-store"
import { useUpdateBusinessHours } from "@/hooks/use-api-queries"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { BusinessHoursError } from "@/services/api/api-profile"
import { getCurrentTimezone, getTimezoneDisplayLabel } from "@/lib/timezone"
import {
  BUSINESS_HOURS_DAY_KEYS,
  type BusinessHoursUiState,
  type DayKey,
  decodeSchedule,
  encodeSchedule,
  isStateValid,
  statesEqual,
} from "@/lib/business-hours-codec"
import { BusinessHoursDaySelector } from "./business-hours-day-selector"
import { BusinessHoursTimeInput } from "./business-hours-time-input"

export interface BusinessHoursFormProps {
  onClose: () => void
}

export function BusinessHoursForm({ onClose }: BusinessHoursFormProps) {
  const { t } = useTranslations()
  const { showAlert, hideAlert } = useAlertDialog()
  const schedule = useUserDataStore((s) => s.userData?.schedule)
  const mutation = useUpdateBusinessHours()

  const initial = useMemo<BusinessHoursUiState>(
    () => decodeSchedule(schedule ?? null, getCurrentTimezone()),
    [schedule],
  )
  const [state, setState] = useState<BusinessHoursUiState>(initial)

  // Re-seed when the underlying schedule changes (e.g. another tab updated).
  useEffect(() => {
    setState(initial)
  }, [initial])

  const dayLabels: Record<DayKey, string> = {
    mon: t("myAds.businessHours.dayMon"),
    tue: t("myAds.businessHours.dayTue"),
    wed: t("myAds.businessHours.dayWed"),
    thu: t("myAds.businessHours.dayThu"),
    fri: t("myAds.businessHours.dayFri"),
    sat: t("myAds.businessHours.daySat"),
    sun: t("myAds.businessHours.daySun"),
  }

  const valid = isStateValid(state)
  const dirty = !statesEqual(state, initial)
  const canSave = valid && dirty && !mutation.isPending

  const toggleDay = (day: DayKey) => {
    setState((prev) => {
      const next = new Set(prev.selectedDays)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return { ...prev, selectedDays: next }
    })
  }

  const onSave = async () => {
    try {
      await mutation.mutateAsync(encodeSchedule(state))
      onClose()
    } catch (err) {
      handleSaveError(err)
    }
  }

  const handleSaveError = (err: unknown) => {
    const code = err instanceof BusinessHoursError ? err.code : undefined

    if (code === "SchedulePeriodInvalid") {
      showAlert({
        title: t("myAds.businessHours.schedulePeriodInvalidTitle"),
        description: t("myAds.businessHours.schedulePeriodInvalidMessage"),
        confirmText: t("myAds.businessHours.editSchedule"),
        cancelText: t("myAds.businessHours.resetSchedule"),
        type: "warning",
        // Edit schedule: just dismiss the alert; the form stays open.
        onConfirm: () => hideAlert(),
        // Reset schedule: turn off business hours, save, and close everything.
        onCancel: async () => {
          const reset: BusinessHoursUiState = { ...state, enabled: false }
          setState(reset)
          try {
            await mutation.mutateAsync(encodeSchedule(reset))
            hideAlert()
            onClose()
          } catch (resetErr) {
            hideAlert()
            handleSaveError(resetErr)
          }
        },
      })
      return
    }

    showAlert({
      title: t("myAds.businessHours.errorGenericTitle"),
      description: code
        ? t("myAds.businessHours.errorGenericMessage", { code })
        : (err as Error)?.message ??
          t("myAds.businessHours.errorGenericMessage", { code: "unknown" }),
      confirmText: t("common.ok"),
      type: "warning",
    })
  }

  const onCancel = () => {
    setState(initial)
    onClose()
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-gray-900">
          {t("myAds.businessHours.title")}
        </h2>
        <p className="text-sm text-gray-600">
          {t("myAds.businessHours.description")}
        </p>
      </header>

      <div className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3">
        <span className="text-base text-gray-900">
          {t("myAds.businessHours.enableLabel")}
        </span>
        <Switch
          checked={state.enabled}
          onCheckedChange={(v) => setState((p) => ({ ...p, enabled: v }))}
          aria-label={t("myAds.businessHours.enableLabel")}
        />
      </div>

      <section className="flex flex-col gap-2">
        <h3
          className={
            state.enabled
              ? "text-base font-bold text-gray-900"
              : "text-base font-bold text-gray-400"
          }
        >
          {t("myAds.businessHours.daysLabel")}
        </h3>
        <BusinessHoursDaySelector
          selectedDays={state.selectedDays}
          dayLabels={dayLabels}
          onToggle={toggleDay}
          enabled={state.enabled}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h3
          className={
            state.enabled
              ? "text-base font-bold text-gray-900"
              : "text-base font-bold text-gray-400"
          }
        >
          {t("myAds.businessHours.hoursLabel")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <BusinessHoursTimeInput
            label={t("myAds.businessHours.openLabel")}
            value={state.openTime}
            enabled={state.enabled}
            onChange={(v) => setState((p) => ({ ...p, openTime: v }))}
            ariaLabel="business-hours-open"
          />
          <BusinessHoursTimeInput
            label={t("myAds.businessHours.closeLabel")}
            value={state.closeTime}
            enabled={state.enabled}
            onChange={(v) => setState((p) => ({ ...p, closeTime: v }))}
            ariaLabel="business-hours-close"
          />
        </div>
        <p
          className={
            state.enabled
              ? "text-xs text-gray-500"
              : "text-xs text-gray-400"
          }
        >
          {t("myAds.businessHours.timezoneSuffix", {
            tz: getTimezoneDisplayLabel(state.timezone),
          })}
        </p>
      </section>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          variant="default"
          size="default"
          disabled={!canSave}
          onClick={onSave}
          className="w-full"
        >
          {t("myAds.businessHours.saveChanges")}
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="w-full"
        >
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  )
}

// Keep import used (re-export day keys for callers in the same module group).
export { BUSINESS_HOURS_DAY_KEYS }
