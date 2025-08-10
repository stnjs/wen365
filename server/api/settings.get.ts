export default defineEventHandler(async event => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Mock settings data
  const settings = {
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
    preferences: {
      theme: "light",
      language: "en",
      timezone: "Europe/Berlin",
      dateFormat: "DD/MM/YYYY",
    },
  };

  return settings;
});
