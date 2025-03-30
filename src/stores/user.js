import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAdmin = computed(() => user.value?.user_metadata?.role === 'admin')

  const setUser = (newUser) => {
    user.value = newUser
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('cart')
      user.value = null
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking user:', error)
      throw error
    }
  }

  return {
    user,
    isAdmin,
    setUser,
    logout,
    checkUser
  }
}) 