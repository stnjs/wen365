import { WagmiPlugin } from '@wagmi/vue'
import { config } from '~/config/wagmi'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    console.log('Initializing Wagmi...')
    nuxtApp.vueApp.use(WagmiPlugin, {
      config,
    })
    console.log('Wagmi initialized successfully')
  }
}) 