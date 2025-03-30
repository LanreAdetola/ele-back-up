<template>
  <div class="storage-test">
    <h2>Storage Policy Test</h2>
    
    <div v-if="!isAuthenticated" class="auth-warning">
      <p>⚠️ You must be logged in to test storage access.</p>
      <button @click="login" class="login-btn">Login</button>
    </div>
    
    <button v-else @click="runTest" :disabled="testing">
      {{ testing ? 'Testing...' : 'Test Storage Access' }}
    </button>

    <div v-if="testResult" class="test-results">
      <h3>Test Results:</h3>
      <div :class="['result', testResult.success ? 'success' : 'error']">
        {{ testResult.message }}
      </div>
      
      <div class="details">
        <p>Bucket Exists: {{ testResult.bucketExists ? '✅' : '❌' }}</p>
        <p>Can List Files: {{ testResult.canListFiles ? '✅' : '❌' }}</p>
        <p>Can Upload: {{ testResult.canUpload ? '✅' : '❌' }}</p>
        <p>Can Get URL: {{ testResult.canGetUrl ? '✅' : '❌' }}</p>
        <p>Can Delete: {{ testResult.canDelete ? '✅' : '❌' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useImageUploader } from '../composables/useImageUploader'

const router = useRouter()
const { testStorageAccess } = useImageUploader()
const testing = ref(false)
const testResult = ref(null)
const isAuthenticated = ref(false)

const checkAuth = async () => {
  const { data } = await supabase.auth.getSession()
  isAuthenticated.value = !!data.session
  console.log('Authentication status:', isAuthenticated.value ? 'Logged in' : 'Not logged in')
}

const login = () => {
  router.push('/login')
}

const runTest = async () => {
  testing.value = true
  testResult.value = await testStorageAccess()
  testing.value = false
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.storage-test {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

button {
  background: #2c5282;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.test-results {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 1rem;
}

.result {
  font-weight: bold;
  margin-bottom: 1rem;
}

.success {
  color: #2f855a;
}

.error {
  color: #c53030;
}

.details {
  display: grid;
  gap: 0.5rem;
}

.details p {
  margin: 0;
}

.auth-warning {
  color: #dd6b20;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #fff8f0;
  border-radius: 4px;
  border: 1px solid #fed7aa;
}

.login-btn {
  background: #dd6b20;
}
</style> 