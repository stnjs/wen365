<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        <button @click="saveSettings" class="btn-primary">Save Settings</button>
      </div>

      <!-- Tax Settings -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          Tax Configuration
        </h2>

        <div class="space-y-6">
          <!-- Country Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Country</label
            >
            <select v-model="settings.country" class="input-field">
              <option value="Germany">Germany</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Other">Other</option>
            </select>
            <p class="text-sm text-gray-500 mt-1">
              Select your country to set the appropriate tax-free period
            </p>
          </div>

          <!-- Tax-Free Period -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Tax-Free Period (Days)</label
            >
            <input
              v-model.number="settings.taxFreePeriodDays"
              type="number"
              min="1"
              max="1095"
              class="input-field"
            />
            <p class="text-sm text-gray-500 mt-1">
              Number of days you need to hold crypto before it becomes tax-free
            </p>
          </div>

          <!-- Currency -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Display Currency</label
            >
            <select v-model="settings.currency" class="input-field">
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
              <option value="CAD">CAD (Canadian Dollar)</option>
              <option value="AUD">AUD (Australian Dollar)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>

        <div class="space-y-6">
          <!-- Email Notifications -->
          <div>
            <label class="flex items-center">
              <input
                v-model="settings.notifications.email"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm font-medium text-gray-700"
                >Email Notifications</span
              >
            </label>
            <p class="text-sm text-gray-500 mt-1 ml-6">
              Receive email alerts when assets become tax-free
            </p>
          </div>

          <div v-if="settings.notifications.email" class="ml-6">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Email Address</label
            >
            <input
              v-model="settings.notifications.emailAddress"
              type="email"
              class="input-field"
              placeholder="your@email.com"
            />
          </div>

          <!-- Telegram Notifications -->
          <div>
            <label class="flex items-center">
              <input
                v-model="settings.notifications.telegram"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm font-medium text-gray-700"
                >Telegram Notifications</span
              >
            </label>
            <p class="text-sm text-gray-500 mt-1 ml-6">
              Receive Telegram alerts when assets become tax-free
            </p>
          </div>

          <div v-if="settings.notifications.telegram" class="ml-6">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Telegram Chat ID</label
            >
            <input
              v-model="settings.notifications.telegramChatId"
              type="text"
              class="input-field"
              placeholder="123456789"
            />
            <p class="text-sm text-gray-500 mt-1">
              Get your Chat ID by messaging @userinfobot on Telegram
            </p>
          </div>

          <!-- Notification Timing -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Notify Days Before</label
            >
            <select
              v-model.number="settings.notifications.notifyDaysBefore"
              class="input-field"
            >
              <option value="1">1 day before</option>
              <option value="3">3 days before</option>
              <option value="7">1 week before</option>
              <option value="14">2 weeks before</option>
              <option value="30">1 month before</option>
            </select>
            <p class="text-sm text-gray-500 mt-1">
              When to send notifications before assets become tax-free
            </p>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          Data Management
        </h2>

        <div class="space-y-4">
          <div
            class="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium text-gray-900">Clear All Data</div>
              <div class="text-sm text-gray-500">
                Remove all stored portfolio and transaction data
              </div>
            </div>
            <button
              @click="clearAllData"
              class="btn-secondary text-red-600 hover:text-red-700"
            >
              Clear Data
            </button>
          </div>

          <div
            class="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium text-gray-900">Reset Settings</div>
              <div class="text-sm text-gray-500">
                Reset all settings to default values
              </div>
            </div>
            <button @click="resetSettings" class="btn-secondary">Reset</button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          About HODLTracker
        </h2>

        <div class="space-y-4 text-sm text-gray-600">
          <p>
            HODLTracker helps you track your crypto holdings with FIFO logic for
            tax planning. Perfect for users in countries with tax-free periods
            like Germany's 1-year rule.
          </p>
          <p>
            <strong>Version:</strong> 1.0.0<br />
            <strong>Built with:</strong> Vue 3, TypeScript, Tailwind CSS<br />
            <strong>Data Sources:</strong> Ethereum blockchain via
            Covalent/Alchemy APIs
          </p>
          <p>
            <strong>Disclaimer:</strong> This tool is for informational purposes
            only. Please consult with a qualified tax professional for your
            specific tax situation.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { useSettingsStore } from "~/stores/settings";

const walletStore = useWalletStore();
const settingsStore = useSettingsStore();

const address = computed(() => walletStore.address);
const settings = ref(settingsStore.settings);

const shortAddress = computed(() => {
  if (!address.value) return "";
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`;
});

const saveSettings = async () => {
  try {
    await settingsStore.updateSettings(settings.value);
    // Show success message
    console.log("Settings saved successfully");
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};

const clearAllData = () => {
  if (
    confirm(
      "Are you sure you want to clear all data? This action cannot be undone."
    )
  ) {
    // TODO: Implement data clearing
    console.log("Clearing all data...");
  }
};

const resetSettings = () => {
  if (confirm("Are you sure you want to reset all settings to default?")) {
    settingsStore.resetSettings();
    settings.value = settingsStore.settings;
  }
};

const disconnectWallet = () => {
  walletStore.disconnectWallet();
};

onMounted(async () => {
  await settingsStore.loadSettings();
  settings.value = settingsStore.settings;
});
</script>
