<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import { ref } from 'vue'
import './assets/css/variables.css'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Translations for language selector
const translations = {
  welcome: 'Welcome to Elegant Gem',
  select: 'Please select your preferred language'
}

// Handle language selection
const handleLanguageSelect = (lang) => {
  locale.value = lang
  // Save the selected language in localStorage for future use
  localStorage.setItem('app_language', lang)
}
</script>

<template>
  <div class="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
    <LanguageSelector 
      :translations="translations"
      @selectLanguage="handleLanguageSelect"
    />
  </div>
</template>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: var(--color-text-primary);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  min-height: 100vh;
}

a {
  color: var(--color-text-primary);
  text-decoration: none;
  transition: var(--transition-medium);
}

button {
  font-family: inherit;
}

* {
  box-sizing: border-box;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
