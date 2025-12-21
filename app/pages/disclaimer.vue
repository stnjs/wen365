<template>
  <NuxtLayout name="landing-page">
    <section class="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div class="max-w-4xl mx-auto">
        <UCard class="bg-app-card border-muted">
          <template #header>
            <h1 class="text-4xl md:text-5xl font-medium text-white tracking-tighter mb-2">
              Disclaimer
            </h1>
            <p class="text-dimmed text-sm">Last updated: [LAST_UPDATED_DATE]</p>
          </template>

          <div class="prose prose-invert max-w-none space-y-8">
            <div>
              <p class="text-muted leading-relaxed">
                This Disclaimer ("Disclaimer") applies to your use of wen365, a cryptocurrency
                portfolio tracking application operated by [YOUR_NAME] ("we", "our", or "us"). By
                using our service, you acknowledge that you have read, understood, and agree to be
                bound by this Disclaimer.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">1. Not Financial Advice</h2>
              <div class="space-y-4 text-muted">
                <p>
                  <strong class="text-default">wen365 does not provide financial, investment, or
                  trading advice.</strong> The information displayed in the application, including
                  portfolio values, token prices, and transaction history, is for informational
                  purposes only.
                </p>
                <p>
                  Any decisions you make regarding your cryptocurrency investments are solely your
                  responsibility. You should consult with a qualified financial advisor before making
                  any investment decisions.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">2. Informational Purposes Only</h2>
              <div class="space-y-4 text-muted">
                <p>
                  The data and information provided by wen365 are intended for informational and
                  educational purposes only. This includes:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Portfolio balances and values</li>
                  <li>Token prices and market data</li>
                  <li>Transaction history</li>
                  <li>Asset flow visualizations</li>
                  <li>Holding time tracking</li>
                </ul>
                <p>
                  This information should not be construed as a recommendation to buy, sell, or hold
                  any cryptocurrency or other financial instrument.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">3. No Guarantees on Data Accuracy</h2>
              <div class="space-y-4 text-muted">
                <p>
                  While we strive to provide accurate and up-to-date information, we make no
                  representations or warranties regarding:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>The accuracy, completeness, or timeliness of portfolio data</li>
                  <li>The accuracy of token prices or market values</li>
                  <li>The reliability of third-party API services (including Alchemy API)</li>
                  <li>The availability or uninterrupted operation of the service</li>
                </ul>
                <p>
                  Portfolio data is retrieved from third-party blockchain APIs and may contain
                  errors, delays, or inaccuracies. You should verify important information
                  independently.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">4. User Assumes All Risk</h2>
              <div class="space-y-4 text-muted">
                <p>
                  <strong class="text-default">You acknowledge and agree that you use wen365 at
                  your own risk.</strong> Cryptocurrency investments are highly volatile and
                  speculative. You may lose some or all of your invested capital.
                </p>
                <p>We are not responsible for:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Any losses resulting from your investment decisions</li>
                  <li>Errors or inaccuracies in displayed portfolio data</li>
                  <li>Service interruptions or technical issues</li>
                  <li>Security breaches or unauthorized access to your wallet</li>
                  <li>Changes in cryptocurrency values or market conditions</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">5. No Tax Advice</h2>
              <div class="space-y-4 text-muted">
                <p>
                  <strong class="text-default">wen365 does not provide tax, legal, or accounting
                  advice.</strong> While the application may track holding times and asset flows for
                  informational purposes, this information should not be used as a substitute for
                  professional tax advice.
                </p>
                <p>
                  Tax laws vary by jurisdiction and are subject to change. You are solely responsible
                  for:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Determining your tax obligations</li>
                  <li>Filing accurate tax returns</li>
                  <li>Consulting with qualified tax professionals</li>
                  <li>Compliance with applicable tax laws</li>
                </ul>
                <p>
                  We make no representations or warranties regarding the tax implications of your
                  cryptocurrency transactions or holdings.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">6. Third-Party Data</h2>
              <div class="space-y-4 text-muted">
                <p>
                  wen365 relies on third-party services and APIs to provide portfolio data, including:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-default">Alchemy API:</strong> For blockchain data and token
                    information
                  </li>
                  <li>
                    <strong class="text-default">Price Data Providers:</strong> For cryptocurrency
                    prices and market data
                  </li>
                </ul>
                <p>
                  We do not control these third-party services and are not responsible for their
                  accuracy, availability, or reliability. Any issues with third-party data are beyond
                  our control.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">7. No Endorsement</h2>
              <div class="space-y-4 text-muted">
                <p>
                  The display of any cryptocurrency, token, or blockchain network in wen365 does not
                  constitute an endorsement, recommendation, or solicitation to buy, sell, or hold
                  that asset.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">8. Regulatory Compliance</h2>
              <div class="space-y-4 text-muted">
                <p>
                  Cryptocurrency regulations vary by jurisdiction and are subject to change. You are
                  solely responsible for:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Understanding and complying with applicable laws in your jurisdiction</li>
                  <li>Obtaining necessary licenses or permissions</li>
                  <li>Reporting cryptocurrency transactions as required by law</li>
                </ul>
                <p>
                  We make no representations or warranties regarding regulatory compliance or the
                  legality of cryptocurrency activities in any jurisdiction.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">9. Limitation of Liability</h2>
              <div class="space-y-4 text-muted">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY DIRECT,
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT
                  NOT LIMITED TO:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Loss of profits, revenue, or data</li>
                  <li>Investment losses</li>
                  <li>Errors or inaccuracies in displayed information</li>
                  <li>Service interruptions or failures</li>
                  <li>Any other damages arising from your use of wen365</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">10. Contact Us</h2>
              <div class="space-y-4 text-muted">
                <p>
                  If you have any questions about this Disclaimer, please contact us at
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

