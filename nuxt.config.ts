// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  pages: false,
  css: ['~/assets/main.css'],
  vite: {
    build: {
      modulePreload: false,
    },
  },
})
