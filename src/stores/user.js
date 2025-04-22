import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const userRole = ref(null) // ✅ actual role from user_profiles

  const isAdmin = computed(() => userRole.value === 'admin')

  const setUser = (newUser) => {
    user.value = newUser
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('cart')
      user.value = null
      userRole.value = null
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  const fetchUserRole = async () => {
    if (!user.value?.id) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.value.id)
      .single()

    if (error) {
      console.warn('Could not fetch user role from user_profiles:', error.message)
      userRole.value = null
    } else {
      userRole.value = data.role
    }
  }

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        await fetchUserRole()
      }
    } catch (error) {
      console.error('Error checking user:', error)
      throw error
    }
  }

  return {
    user,
    userRole,
    isAdmin,
    setUser,
    logout,
    checkUser
  }
})
