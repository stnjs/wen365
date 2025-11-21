<template>
  <NuxtLayout name="landing-page">
    <section class="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div class="max-w-4xl mx-auto">
        <UCard class="bg-zinc-900/50 border-white/5">
          <template #header>
            <h1 class="text-4xl md:text-5xl font-medium text-white tracking-tighter mb-2">
              Cookie Policy
            </h1>
            <p class="text-zinc-500 text-sm">Last updated: [LAST_UPDATED_DATE]</p>
          </template>

          <div class="prose prose-invert max-w-none space-y-8">
            <div>
              <p class="text-zinc-400 leading-relaxed">
                This Cookie Policy explains how [YOUR_NAME] ("we", "our", or "us") uses cookies and
                similar technologies in wen365, a cryptocurrency portfolio tracking application.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">1. What Are Cookies?</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  Cookies are small text files that are stored on your device when you visit a
                  website. They are widely used to make websites work more efficiently and provide
                  information to website owners.
                </p>
                <p>
                  Cookies can be "session" cookies (temporary and deleted when you close your
                  browser) or "persistent" cookies (stored on your device until they expire or you
                  delete them).
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">2. Types of Cookies We Use</h2>
              <div class="space-y-4 text-zinc-400">
                <h3 class="text-xl font-medium text-zinc-300 mt-6 mb-3">
                  Essential Cookies (Session Cookies)
                </h3>
                <p>
                  We use essential session cookies to maintain your authentication state when you
                  connect your wallet. These cookies are necessary for the application to function
                  properly and include:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-zinc-300">Authentication Cookies:</strong> Used to maintain
                    your wallet connection session and verify your identity. These cookies are set
                    through nuxt-auth-utils when you sign in with your Ethereum wallet (SIWE - Sign-In
                    With Ethereum).
                  </li>
                  <li>
                    <strong class="text-zinc-300">Session Management:</strong> Used to track your
                    active session and prevent unauthorized access to your portfolio data.
                  </li>
                </ul>
                <p>
                  These cookies are automatically deleted when you close your browser. They do not
                  contain personal information and cannot be used to identify you personally.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">3. How We Use Cookies</h2>
              <div class="space-y-4 text-zinc-400">
                <p>We use cookies for the following purposes:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-zinc-300">Authentication:</strong> To maintain your wallet
                    connection and authenticate your identity
                  </li>
                  <li>
                    <strong class="text-zinc-300">Security:</strong> To protect against unauthorized
                    access and maintain session security
                  </li>
                  <li>
                    <strong class="text-zinc-300">Functionality:</strong> To remember your
                    preferences and provide a seamless user experience
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">4. Third-Party Cookies</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  We may use third-party services that set their own cookies. These include:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-zinc-300">Reown AppKit (WalletConnect):</strong> Used for
                    wallet connection functionality. Please refer to their privacy policy for
                    information about their cookie usage.
                  </li>
                </ul>
                <p>
                  We do not control these third-party cookies. Please review the privacy policies of
                  these third-party services for more information about their cookie practices.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">5. How to Manage Cookies</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  You have the right to control and manage cookies. However, please note that
                  disabling essential cookies may affect the functionality of wen365.
                </p>
                <h3 class="text-xl font-medium text-zinc-300 mt-6 mb-3">Browser Settings</h3>
                <p>You can control cookies through your browser settings:</p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong class="text-zinc-300">Chrome:</strong> Settings → Privacy and security →
                    Cookies and other site data
                  </li>
                  <li>
                    <strong class="text-zinc-300">Firefox:</strong> Options → Privacy & Security →
                    Cookies and Site Data
                  </li>
                  <li>
                    <strong class="text-zinc-300">Safari:</strong> Preferences → Privacy → Manage
                    Website Data
                  </li>
                  <li>
                    <strong class="text-zinc-300">Edge:</strong> Settings → Cookies and site
                    permissions → Cookies and site data
                  </li>
                </ul>
                <h3 class="text-xl font-medium text-zinc-300 mt-6 mb-3">Disabling Cookies</h3>
                <p>
                  If you disable essential cookies, you may not be able to:
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                  <li>Connect your wallet</li>
                  <li>Maintain your authentication session</li>
                  <li>Access your portfolio data</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">6. Cookie Consent</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  By using wen365, you consent to our use of cookies as described in this Cookie
                  Policy. If you do not agree to our use of cookies, please disable them through your
                  browser settings or refrain from using our service.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">7. Changes to This Cookie Policy</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  We may update this Cookie Policy from time to time. We will notify you of any
                  changes by posting the new Cookie Policy on this page and updating the "Last
                  updated" date.
                </p>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-medium text-white mb-4 mt-8">8. Contact Us</h2>
              <div class="space-y-4 text-zinc-400">
                <p>
                  If you have any questions about this Cookie Policy, please contact us at
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

