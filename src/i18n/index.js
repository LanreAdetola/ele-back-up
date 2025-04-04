import { createI18n } from 'vue-i18n'
import en from './en'
import fr from './fr'

const messages = {
  en,
  fr
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('app_language') || 'en',
  fallbackLocale: 'en',
  messages
})

export default i18n 