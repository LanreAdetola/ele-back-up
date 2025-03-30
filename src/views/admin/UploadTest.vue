<template>
  <div class="upload-test">
    <h1>Upload Test</h1>
    
    <div class="upload-container">
      <input type="file" ref="fileInput" accept="image/*" @change="handleFileSelected" />
      <button @click="uploadFile" :disabled="!selectedFile || uploading">
        {{ uploading ? 'Uploading...' : 'Upload Image' }}
      </button>
      
      <div v-if="uploading" class="progress">
        <progress :value="uploadProgress" max="100"></progress>
        <div>{{ uploadProgress }}%</div>
      </div>
      
      <div v-if="uploadUrl" class="result success">
        <p>Upload successful!</p>
        <img :src="uploadUrl" alt="Uploaded image" style="max-width: 300px; max-height: 300px;" />
        <div>URL: {{ uploadUrl }}</div>
      </div>
      
      <div v-if="uploadError" class="result error">
        <p>Upload failed:</p>
        <pre>{{ uploadError }}</pre>
      </div>
    </div>

    <div class="debug">
      <h3>Debug Info</h3>
      <button @click="testAuth">Test Authentication</button>
      <button @click="createBucket">Create Bucket</button>
      <button @click="directUploadTest">Direct Upload Test</button>
      
      <pre v-if="debugInfo" class="debug-output">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../../lib/supabase'

const fileInput = ref(null)
const selectedFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadUrl = ref(null)
const uploadError = ref(null)
const debugInfo = ref(null)

const handleFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    uploadError.value = null
    uploadUrl.value = null
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  uploadProgress.value = 0
  uploadError.value = null
  uploadUrl.value = null
  
  try {
    const file = selectedFile.value
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`
    
    // Try to upload
    const { data, error } = await supabase
      .storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })
    
    if (error) throw error
    
    // Get URL
    const { data: urlData } = await supabase
      .storage
      .from('product-images')
      .getPublicUrl(filePath)
    
    uploadUrl.value = urlData.publicUrl
    uploadProgress.value = 100
  } catch (error) {
    console.error('Upload error:', error)
    uploadError.value = error.message || 'Unknown error'
  } finally {
    uploading.value = false
  }
}

const testAuth = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    debugInfo.value = {
      session: data.session ? 'Valid session' : 'No session',
      user: data.session?.user || null,
      error: error || null
    }
  } catch (error) {
    debugInfo.value = { error: error.message }
  }
}

const createBucket = async () => {
  try {
    const { data, error } = await supabase
      .storage
      .createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })
    
    debugInfo.value = { result: data || 'Bucket created', error }
  } catch (error) {
    debugInfo.value = { error: error.message }
  }
}

const directUploadTest = async () => {
  try {
    debugInfo.value = { status: 'starting test' }
    
    // Create a test file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    // Try upload
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('product-images')
      .upload('test.txt', testFile, { upsert: true })
    
    if (uploadError) throw uploadError
    
    debugInfo.value = { 
      status: 'upload successful',
      uploadData,
      uploadError: null
    }
    
    // Try get URL
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('product-images')
      .getPublicUrl('test.txt')
    
    if (urlError) throw urlError
    
    debugInfo.value = {
      ...debugInfo.value,
      status: 'getPublicUrl successful',
      url: urlData.publicUrl,
      urlError: null
    }
    
  } catch (error) {
    debugInfo.value = {
      ...debugInfo.value,
      status: 'error',
      error: error.message
    }
  }
}
</script>

<style scoped>
.upload-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.upload-container {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.progress {
  margin: 1rem 0;
}

.result {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 0.25rem;
}

.success {
  background-color: #f0fff4;
  border: 1px solid #c6f6d5;
}

.error {
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  color: #e53e3e;
}

.debug {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #f7fafc;
}

.debug button {
  margin-right: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.debug button:hover {
  background-color: #2d3748;
}

.debug-output {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  white-space: pre-wrap;
  overflow-x: auto;
}
</style> 