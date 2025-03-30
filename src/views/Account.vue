<template>
    <div class="account-container">
      <h1>My Account</h1>
  
      <div v-if="user" class="account-details">
        <p><strong>Email:</strong> {{ user.email }}</p>
      </div>
  
      <div class="account-actions">
        <button @click="handlePasswordReset">Reset Password</button>
        <button @click="handleLogout">Logout</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../lib/supabase'
  
  const router = useRouter()
  const user = ref(null)
  
  const fetchUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
  }
  
  const handlePasswordReset = async () => {
    if (!user.value?.email) return
    try {
      await supabase.auth.resetPasswordForEmail(user.value.email)
      alert('Password reset email sent.')
    } catch (error) {
      console.error('Reset error:', error)
      alert('Something went wrong.')
    }
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('cart')
    router.push('/login')
  }
  
  onMounted(() => {
    fetchUser()
  })
  </script>
  
  <style scoped>
  .account-container {
    max-width: 600px;
    margin: 3rem auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #2c5282;
    font-size: 1.8rem;
  }
  
  .account-details p {
    font-size: 1.1rem;
    color: #4a5568;
    margin-bottom: 1rem;
  }
  
  .account-actions button {
    margin-right: 1rem;
    padding: 0.5rem 1rem;
    background: #2c5282;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .account-actions button:hover {
    background: #2a4365;
  }
  </style>
  