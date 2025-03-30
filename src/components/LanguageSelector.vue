<template>
  <transition name="fade">
    <div v-if="isVisible" class="language-selector">
      <div class="language-selector-container">
        <div class="logo-container">
          <img 
            src="/src/assets/elegant-background.png" 
            alt="Logo" 
            class="logo" 
            @error="handleImageError"
            v-if="!useDefaultLogo" 
          />
          <!-- Fallback SVG logo -->
          <svg v-else class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="10" fill="#3182ce" />
            <circle cx="50" cy="50" r="30" fill="white" />
            <text x="50" y="55" font-size="36" text-anchor="middle" fill="#3182ce" font-weight="bold">L</text>
          </svg>
        </div>
        
        <div class="welcome-text">
          <h2>{{ welcomeText }}</h2>
          <p>{{ selectText }}</p>
        </div>
        
        <div class="language-buttons">
          <button 
            class="language-button" 
            @click="selectLanguage('en')"
          >
            <span class="flag">🇬🇧</span>
            <span class="language-name">English</span>
          </button>
          
          <button 
            class="language-button" 
            @click="selectLanguage('fr')"
          >
            <span class="flag">🇫🇷</span>
            <span class="language-name">Français</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const isVisible = ref(false)
const useDefaultLogo = ref(false)
const STORAGE_KEY = 'language_selected'

const emit = defineEmits(['selectLanguage'])

// Props with defaults for i18n
const props = defineProps({
  translations: {
    type: Object,
    default: () => ({
      welcome: 'Welcome to our store',
      select: 'Please select your preferred language'
    })
  }
})

// Computed properties for text (enables i18n support)
const welcomeText = computed(() => {
  // If using i18n, you can replace this with $t('language.welcome')
  return props.translations.welcome
})

const selectText = computed(() => {
  // If using i18n, you can replace this with $t('language.select')
  return props.translations.select
})

const handleImageError = () => {
  useDefaultLogo.value = true
}

const selectLanguage = (lang) => {
  localStorage.setItem(STORAGE_KEY, 'true')
  isVisible.value = false
  emit('selectLanguage', lang)
}

onMounted(() => {
  // Check if user has already selected a language
  const hasSelectedLanguage = localStorage.getItem(STORAGE_KEY)
  
  if (!hasSelectedLanguage) {
    // Show the language selector on first visit
    isVisible.value = true
  }
})
</script>

<style scoped>
.language-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.language-selector-container {
  background-color: white;
  border-radius: 1rem;
  padding: 2.5rem;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.logo-container {
  margin-bottom: 2rem;
}

.logo {
  width: 120px;
  height: auto;
}

.welcome-text {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-text h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.welcome-text p {
  font-size: 1.1rem;
  color: #718096;
}

.language-buttons {
  display: flex;
  gap: 1.5rem;
  width: 100%;
}

.language-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background-color: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-button:hover {
  background-color: #ebf8ff;
  border-color: #3182ce;
  transform: translateY(-5px);
}

.flag {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.language-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .language-selector-container {
    padding: 2rem 1.5rem;
  }
  
  .welcome-text h2 {
    font-size: 1.5rem;
  }
  
  .welcome-text p {
    font-size: 1rem;
  }
  
  .language-buttons {
    flex-direction: column;
  }
  
  .language-button {
    padding: 1.25rem 1rem;
  }
}
</style> 