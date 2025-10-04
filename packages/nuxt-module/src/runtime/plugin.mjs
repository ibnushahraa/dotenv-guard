import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // Environment variables are already loaded into process.env by the module
  // This plugin can be used for additional runtime logic if needed

  if (process.dev) {
    console.log('[dotenv-guard] Plugin loaded')
  }
})
