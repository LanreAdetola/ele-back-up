<template>
    <div class="register-container">
      <div class="register-box">
        <h1>Create Account</h1>
        <p class="subtitle">Join us and start exploring</p>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required 
              placeholder="Enter your email"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required 
              placeholder="Create a password"
            >
          </div>
  
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>
          
          <button 
            type="submit" 
            class="register-button"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </form>
  
        <div class="login-link">
          <p>Already have an account? <a href="#" @click.prevent="goToLogin">Sign In</a></p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../lib/supabase'
  
  const router = useRouter()
  const email = ref('')
  const password = ref('')
  const error = ref('')
  const success = ref('')
  const isLoading = ref(false)
  
  const handleRegister = async () => {
    isLoading.value = true
    error.value = ''
    success.value = ''
  
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
  
      if (signUpError) throw signUpError
  
      if (data.user) {
        success.value = 'Registration successful! Please check your email to confirm.'
        email.value = ''
        password.value = ''
      }
    } catch (err) {
      error.value = err.message || 'Registration failed'
    } finally {
      isLoading.value = false
    }
  }
  
  const goToLogin = () => {
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-primary);
    padding: 1rem;
  }
  
  .register-box {
    background: var(--color-bg-secondary);
    padding: 2rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--color-border-light);
  }
  
  h1 {
    margin: 0 0 0.5rem;
    color: var(--color-text-primary);
    font-size: 1.8rem;
    text-align: center;
  }
  
  .subtitle {
    color: var(--color-text-secondary);
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .register-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    color: var(--color-text-primary);
    font-weight: 500;
  }
  
  input {
    padding: 0.75rem;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    transition: border-color var(--transition-medium);
    background-color: var(--color-bg-tertiary);
  }
  
  input:focus {
    outline: none;
    border-color: var(--color-text-secondary);
    box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.1);
  }
  
  .register-button {
    padding: 0.75rem;
    background: var(--color-bg-accent);
    color: var(--color-text-on-dark);
    border: none;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    cursor: pointer;
    transition: background-color var(--transition-medium), transform var(--transition-fast);
    font-weight: 500;
  }
  
  .register-button:hover:not(:disabled) {
    background: #444444;
    transform: translateY(-2px);
  }
  
  .register-button:disabled {
    background: var(--color-text-tertiary);
    cursor: not-allowed;
  }
  
  .error-message {
    color: var(--color-error);
    font-size: 0.9rem;
    text-align: center;
  }
  
  .success-message {
    color: var(--color-success);
    font-size: 0.9rem;
    text-align: center;
  }
  
  .login-link {
    margin-top: 1.5rem;
    text-align: center;
    color: var(--color-text-secondary);
  }
  
  .login-link a {
    color: var(--color-text-primary);
    text-decoration: none;
    font-weight: 500;
  }
  
  .login-link a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 480px) {
    .register-box {
      padding: 1.5rem;
    }
  
    h1 {
      font-size: 1.5rem;
    }
  
    .subtitle {
      font-size: 0.9rem;
    }
  
    input {
      padding: 0.6rem;
      font-size: 0.95rem;
    }
  
    .register-button {
      padding: 0.6rem;
      font-size: 0.95rem;
    }
  }
  </style>
  