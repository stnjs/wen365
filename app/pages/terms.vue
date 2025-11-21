<template>
  <NuxtLayout name="landing-page">
    <section class="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div class="max-w-4xl mx-auto">
        <UCard class="bg-zinc-900/50 border-white/5">
          <template #header>
            <h1 class="text-4xl md:text-5xl font-medium text-white tracking-tighter mb-2">
              Terms of Service
            </h1>
            <p class="text-zinc-500 text-sm">Last updated: [LAST_UPDATED_DATE]</p>
          </template>

          <div class="prose prose-invert max-w-none space-y-8">
            <div>
              <p class="text-zinc-400 leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of wen365, a
                cryptocurrency portfolio tracking application operated by [YOUR_NAME] ("we", "our", or
                "us"). By accessing or using our service, you agree to be bound by these Terms.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">1. Acceptance of Terms</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  By accessing or using wen365, you agree to comply with and be bound by these Terms.
                  If you do not agree to these Terms, you may not use our service.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">2. Description of Service</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  wen365 is a portfolio tracking application that allows you to:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Connect your cryptocurrency wallets</li>
                  <li>View your portfolio balances across multiple blockchain networks</li>
                  <li>Track token holdings and values</li>
                  <li>Monitor asset flows and transaction history</li>
                </ul>
                <p>
                  We provide this service for informational purposes only. We do not provide
                  financial, investment, or tax advice.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">3. User Responsibilities</h2>
              <div class="space-y-4 text-zinc-400">
                <p>You agree to:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Use the service only for lawful purposes</li>
                  <li>Maintain the security of your wallet and authentication credentials</li>
                  <li>Not attempt to interfere with or disrupt the service</li>
                  <li>Not use the service to violate any applicable laws or regulations</li>
                  <li>Verify the accuracy of information displayed in your portfolio</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">4. Wallet Connection</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  When you connect your wallet to wen365, you are using Sign-In With Ethereum (SIWE)
                  authentication. You are solely responsible for:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>The security of your wallet and private keys</li>
                  <li>All transactions initiated through your connected wallet</li>
                  <li>Any losses resulting from unauthorized access to your wallet</li>
                </ul>
                <p>
                  We do not have access to your private keys or the ability to initiate transactions
                  on your behalf.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">5. Data Accuracy</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  Portfolio data is retrieved from third-party blockchain APIs (including Alchemy
                  API). While we strive to provide accurate information, we cannot guarantee:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>The accuracy or completeness of portfolio data</li>
                  <li>The timeliness of data updates</li>
                  <li>The availability of third-party API services</li>
                </ul>
                <p>
                  You should verify important information independently and not rely solely on data
                  displayed in wen365.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">6. Account Termination</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  We reserve the right to suspend or terminate your access to wen365 at any time,
                  with or without cause, and with or without notice, for any reason including:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Abuse of the service</li>
                </ul>
                <p>
                  You may stop using the service at any time by disconnecting your wallet.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">7. Limitation of Liability</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, data, or other intangible losses</li>
                  <li>Errors or inaccuracies in portfolio data</li>
                  <li>Service interruptions or unavailability</li>
                  <li>Any losses resulting from your use of the service</li>
                </ul>
                <p>
                  Our total liability shall not exceed the amount you paid to use the service (which
                  is currently $0, as the service is free).
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">8. Disclaimer of Warranties</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">9. Changes to Terms</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify you of any
                  material changes by posting the updated Terms on this page and updating the "Last
                  updated" date. Your continued use of the service after such changes constitutes
                  acceptance of the new Terms.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">10. Contact Us</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  If you have any questions about these Terms, please contact us at
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

