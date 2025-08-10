// Pinia is auto-imported by Nuxt
import { ref, computed } from "vue";
import type { TaxSettings, NotificationSettings } from "~/types";

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
  const updateSettings = async (newSettings: Partial<TaxSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
    await saveSettings();
  };

  const updateNotificationSettings = async (
    notificationSettings: Partial<NotificationSettings>
  ) => {
    settings.value.notifications = {
      ...settings.value.notifications,
      ...notificationSettings,
    };
    await saveSettings();
  };

  const setCountry = async (country: string) => {
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

    await saveSettings();
  };

  const setTaxFreePeriod = async (days: number) => {
    settings.value.taxFreePeriodDays = days;
    await saveSettings();
  };

  const loadSettings = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Use $fetch for SPA mode
      const data = await $fetch<TaxSettings>("/api/settings");

      if (data) {
        settings.value = { ...settings.value, ...data };
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load settings";
    } finally {
      isLoading.value = false;
    }
  };

  const saveSettings = async () => {
    try {
      // Use $fetch for SPA mode
      await $fetch("/api/settings", {
        method: "POST",
        body: settings.value,
      });
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
