<template>
  <NuxtLayout name="landing-page">
    <section class="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div class="max-w-4xl mx-auto">
        <UCard class="bg-zinc-900/50 border-white/5">
          <template #header>
            <h1 class="text-4xl md:text-5xl font-medium text-white tracking-tighter mb-2">
              Privacy Policy
            </h1>
            <p class="text-zinc-500 text-sm">Last updated: [LAST_UPDATED_DATE]</p>
          </template>

          <div class="prose prose-invert max-w-none space-y-8">
            <div>
              <p class="text-zinc-400 leading-relaxed">
                This Privacy Policy describes how [YOUR_NAME] ("we", "our", or "us") collects, uses,
                and protects your personal information when you use wen365, a cryptocurrency portfolio
                tracking application.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">1. Information We Collect</h2>
              <div class="space-y-4 text-zinc-400">
                <p>We collect the following types of information:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-zinc-300">Wallet Addresses:</strong> When you connect your
                    wallet, we collect your Ethereum wallet address to fetch and display your
                    portfolio data.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Portfolio Data:</strong> We retrieve and display
                    your token balances, transaction history, and portfolio values from blockchain
                    networks.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Session Data:</strong> We use session cookies to
                    maintain your authentication state and preferences.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Usage Data:</strong> We may collect information
                    about how you interact with our application, including pages visited and features
                    used.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">2. How We Use Your Information</h2>
              <div class="space-y-4 text-zinc-400">
                <p>We use the collected information for the following purposes:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>To provide and maintain our portfolio tracking service</li>
                  <li>To authenticate your wallet connection</li>
                  <li>To fetch and display your portfolio data from blockchain networks</li>
                  <li>To improve our services and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">3. Data Storage and Security</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  We implement appropriate technical and organizational measures to protect your
                  personal information. However, please note that:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Wallet addresses and portfolio data are stored temporarily in session storage
                    only while you are actively using the application.
                  </li>
                  <li>
                    We do not store your private keys or seed phrases. All wallet connections are
                    handled through secure authentication protocols (SIWE - Sign-In With Ethereum).
                  </li>
                  <li>
                    While we strive to protect your data, no method of transmission over the internet
                    is 100% secure.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">4. Third-Party Services</h2>
              <div class="space-y-4 text-zinc-400">
                <p>We use the following third-party services:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-zinc-300">Alchemy API:</strong> We use Alchemy API to fetch
                    your portfolio data from various blockchain networks. Your wallet address is
                    transmitted to Alchemy to retrieve token balances and transaction data.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Reown AppKit:</strong> We use Reown AppKit
                    (formerly WalletConnect) for wallet connection functionality.
                  </li>
                </ul>
                <p>
                  These third-party services have their own privacy policies governing the use of
                  your information. We encourage you to review their privacy policies.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">5. Your Rights (GDPR Compliance)</h2>
              <div class="space-y-4 text-zinc-400">
                <p>If you are located in the European Economic Area (EEA), you have certain rights:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-zinc-300">Right to Access:</strong> You can request access
                    to your personal data.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Right to Rectification:</strong> You can request
                    correction of inaccurate data.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Right to Erasure:</strong> You can request
                    deletion of your data.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Right to Data Portability:</strong> You can
                    request a copy of your data in a portable format.
                  </li>
                  <li>
                    <strong class="text-zinc-300">Right to Object:</strong> You can object to
                    processing of your data.
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us at [YOUR_EMAIL]. We will respond to
                  your request within 30 days.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">6. Cookies</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  We use session cookies to maintain your authentication state. These cookies are
                  essential for the functioning of the application and are automatically deleted
                  when you close your browser. For more information, please see our
                  <NuxtLink to="/cookies" class="text-white hover:underline">Cookie Policy</NuxtLink>.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">7. Changes to This Privacy Policy</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any
                  changes by posting the new Privacy Policy on this page and updating the "Last
                  updated" date.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">8. Contact Us</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  If you have any questions about this Privacy Policy, please contact us at
                  <a href="mailto:[YOUR_EMAIL]" class="text-white hover:underline">[YOUR_EMAIL]</a>.
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false, // We're using NuxtLayout explicitly
});
</script>

