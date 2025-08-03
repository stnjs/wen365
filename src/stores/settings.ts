import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TaxSettings, NotificationSettings } from "@/types";

export const useSettingsStore = defineStore("settings", () => {
  // State
  const settings = ref<TaxSettings>({
    country: "Germany",
    taxFreePeriodDays: 365,
    taxFreeDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
    currency: "EUR",
    notifications: {
      email: false,
      telegram: false,
      emailAddress: "",
      telegramChatId: "",
      notifyDaysBefore: 7,
    },
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const taxFreePeriodDays = computed(() => settings.value.taxFreePeriodDays);
  const country = computed(() => settings.value.country);
  const currency = computed(() => settings.value.currency);
  const notifications = computed(() => settings.value.notifications);

  // Actions
  const updateSettings = (newSettings: Partial<TaxSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
    saveSettings();
  };

  const updateNotificationSettings = (
    notificationSettings: Partial<NotificationSettings>
  ) => {
    settings.value.notifications = {
      ...settings.value.notifications,
      ...notificationSettings,
    };
    saveSettings();
  };

  const setCountry = (country: string) => {
    settings.value.country = country;

    // Set default tax-free period based on country
    switch (country) {
      case "Germany":
        settings.value.taxFreePeriodDays = 365;
        break;
      case "United States":
        settings.value.taxFreePeriodDays = 365;
        break;
      case "United Kingdom":
        settings.value.taxFreePeriodDays = 365;
        break;
      default:
        settings.value.taxFreePeriodDays = 365;
    }

    saveSettings();
  };

  const setTaxFreePeriod = (days: number) => {
    settings.value.taxFreePeriodDays = days;
    saveSettings();
  };

  const loadSettings = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // TODO: Load settings from localStorage or API
      const savedSettings = localStorage.getItem("hodltracker-settings");
      if (savedSettings) {
        settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load settings";
    } finally {
      isLoading.value = false;
    }
  };

  const saveSettings = () => {
    try {
      // TODO: Save settings to localStorage or API
      localStorage.setItem(
        "hodltracker-settings",
        JSON.stringify(settings.value)
      );
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save settings";
    }
  };

  const resetSettings = () => {
    settings.value = {
      country: "Germany",
      taxFreePeriodDays: 365,
      taxFreeDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
      currency: "EUR",
      notifications: {
        email: false,
        telegram: false,
        emailAddress: "",
        telegramChatId: "",
        notifyDaysBefore: 7,
      },
    };
    saveSettings();
  };

  return {
    // State
    settings,
    isLoading,
    error,

    // Getters
    taxFreePeriodDays,
    country,
    currency,
    notifications,

    // Actions
    updateSettings,
    updateNotificationSettings,
    setCountry,
    setTaxFreePeriod,
    loadSettings,
    saveSettings,
    resetSettings,
  };
});
