<template>
  <div class="auth-callback">
    <div class="loading">
      <div class="spinner"></div>
      <p>Authenticating...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

onMounted(async () => {
  try {
    console.log('AuthCallback mounted')
    
    // Get the session from the URL hash
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      router.push('/login')
      return
    }

    console.log('Session:', session)
    
    if (session?.user) {
      console.log('User found in session:', session.user)
      
      // Check if user exists in our database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking user:', userError)
        throw userError
      }

      console.log('Existing user data:', userData)

      if (!userData) {
        console.log('Creating new user record')
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
              role: 'user',
              status: 'active'
            }
          ])
          .select()
          .single()

        if (insertError) {
          console.error('Error creating user:', insertError)
          throw insertError
        } else {
          console.log('User created successfully:', newUser)
        }
      }

      // Redirect to collection page
      router.push('/collection')
    } else {
      console.log('No user in session')
      router.push('/login')
    }
  } catch (error) {
    console.error('AuthCallback error:', error)
    router.push('/login')
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
              url('/images/hero-bg.jpg') center/cover;
}

.loading {
  text-align: center;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 