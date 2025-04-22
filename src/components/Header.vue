<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <router-link to="/"> The Elegant Gem</router-link>
      </div>

      <nav class="nav">
        <router-link to="/collection">{{ $t('nav.collections') }}</router-link>
      </nav>

      <div class="user-actions">
        <div class="lang-menu">
          <button class="lang-button" @click="toggleLangMenu">
            <span class="lang-icon">{{ currentLocale === 'en' ? '🇬🇧' : '🇫🇷' }}</span>
            <span class="lang-label">{{ currentLocale.toUpperCase() }}</span>
            <span class="menu-icon">▼</span>
          </button>

          <div v-if="isLangMenuOpen" class="lang-dropdown">
            <button class="lang-option" :class="{'active': currentLocale === 'en'}" @click="changeLanguage('en')">
              <span class="flag">🇬🇧</span>
              <span>English</span>
            </button>
            <button class="lang-option" :class="{'active': currentLocale === 'fr'}" @click="changeLanguage('fr')">
              <span class="flag">🇫🇷</span>
              <span>Français</span>
            </button>
          </div>
        </div>
        
        <div v-if="user" class="user-menu">
          <button class="user-button" @click="toggleUserMenu">
            <span class="user-email">{{ user.email }}</span>
            <span class="user-icon">▼</span>
          </button>

          <div v-if="isUserMenuOpen" class="user-dropdown">
            <div class="user-info">
              <p class="user-name">{{ user.email }}</p>
            </div>

            <router-link v-if="isAdmin" class="dropdown-item" to="/admin">
              {{ $t('admin.dashboard.title') }}
            </router-link>

            <router-link class="dropdown-item" to="/account">
              {{ $t('account.myAccount') }}
            </router-link>

            <button class="dropdown-item" @click="handleLogout">
              {{ $t('nav.logout') }}
            </button>
          </div>
        </div>

        <router-link v-else to="/login" class="login-button">{{ $t('nav.login') }}</router-link>

        <button class="cart-button" @click="toggleCart">
          <span class="cart-icon">🛒</span>
          <span v-if="cartItemCount > 0" class="cart-count">{{ cartItemCount }}</span>
        </button>
      </div>
    </div>

    <Cart ref="cartRef" :isOpen="isCartOpen" @close="closeCart" @updateCount="updateCartCount" />
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'
import { useI18n } from 'vue-i18n'
import Cart from './Cart.vue'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const { locale, t: $t } = useI18n()
const cartRef = ref(null)
const isCartOpen = ref(false)
const isLangMenuOpen = ref(false)

const user = computed(() => userStore.user)
const isAdmin = computed(() => userStore.isAdmin)
const cartItemCount = computed(() => cartStore.itemCount)
const currentLocale = computed(() => locale.value)

const isUserMenuOpen = ref(false)

const checkUser = async () => {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    userStore.setUser(currentUser)
  } catch (error) {
    console.error('Error checking user:', error)
  }
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  if (isUserMenuOpen.value) isLangMenuOpen.value = false
}

const toggleLangMenu = () => {
  isLangMenuOpen.value = !isLangMenuOpen.value
  if (isLangMenuOpen.value) isUserMenuOpen.value = false
}

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('app_language', lang)
  isLangMenuOpen.value = false
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const closeCart = () => {
  isCartOpen.value = false
}

const updateCartCount = (count) => {
  console.log('Cart count updated:', count)
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.user-menu') && !event.target.closest('.lang-menu')) {
    isUserMenuOpen.value = false
    isLangMenuOpen.value = false
  }
}

onMounted(() => {
  checkUser()
  document.addEventListener('click', handleClickOutside)
  cartStore.loadCart()

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      userStore.setUser(session?.user)
    } else if (event === 'SIGNED_OUT') {
      userStore.setUser(null)
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  background: var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-border-light);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(to right, #2a2a2a, #444444);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.logo a:hover {
  transform: scale(1.05);
}

.logo a::before {
  content: "💎";
  font-size: 1.4rem;
  margin-right: 0.5rem;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-text-primary);
  transition: width 0.3s ease;
}

.nav a:hover {
  color: var(--color-text-primary);
}

.nav a:hover::after,
.nav a.router-link-active::after {
  width: 100%;
}

.nav a.router-link-active {
  color: var(--color-text-primary);
  font-weight: 600;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Language Menu Styles */
.lang-menu {
  position: relative;
}

.lang-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.lang-button:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.lang-icon {
  font-size: 1rem;
}

.lang-label {
  font-weight: 500;
}

.menu-icon {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  transition: transform 0.3s ease;
}

.lang-button:hover .menu-icon {
  transform: rotate(180deg);
  color: var(--color-text-secondary);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  min-width: 160px;
  z-index: 1000;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
}

.lang-option:hover, .lang-option.active {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-left-color: var(--color-text-primary);
}

.flag {
  font-size: 1.1rem;
}

/* User Menu Styles */
.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.user-button:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.user-email {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.user-icon {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  transition: transform 0.3s ease;
}

.user-button:hover .user-icon {
  transform: rotate(180deg);
  color: var(--color-text-secondary);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  min-width: 220px;
  z-index: 1000;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-info {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-tertiary);
}

.user-name {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
}

.dropdown-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-left-color: var(--color-text-primary);
}

.login-button {
  padding: 0.5rem 1.25rem;
  background: var(--color-bg-accent);
  color: var(--color-text-on-dark);
  border: none;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.login-button:hover {
  background: #444444;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cart-button {
  position: relative;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.5rem;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cart-button:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.cart-icon {
  font-size: 1.25rem;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-bg-accent);
  color: var(--color-text-on-dark);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .container {
    padding: 0.75rem 1rem;
  }

  .logo a {
    font-size: 1.3rem;
  }

  .logo a::before {
    font-size: 1.2rem;
    margin-right: 0.4rem;
  }

  .nav {
    display: none;
  }

  .user-email {
    max-width: 100px;
  }
}

@media (max-width: 480px) {
  .user-email {
    display: none;
  }

  .user-button {
    padding: 0.5rem;
  }

  .user-dropdown {
    right: -0.5rem;
  }

  .cart-button {
    width: 36px;
    height: 36px;
  }

  .lang-label {
    display: none;
  }

  .lang-button {
    padding: 0.5rem;
  }
}
</style>
