import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useImageUploader(bucketName = 'product-images') {
  const uploadProgress = ref(0)
  const uploading = ref(false)
  const error = ref(null)

  // Add test function to verify storage access
  const testStorageAccess = async () => {
    try {
      console.log('Starting storage test...')
      
      // Skip checking buckets list and try direct access instead
      console.log('Testing direct bucket access...')
      
      // Test 1: Create products folder if it doesn't exist
      const folderName = "products"
      const emptyFolder = new File([''], '.folder', { type: 'text/plain' })
      const { error: folderError } = await supabase
        .storage
        .from(bucketName)
        .upload(`${folderName}/.folder`, emptyFolder, {
          upsert: true
        })
        
      if (folderError) {
        console.error('Folder creation error:', folderError)
        throw folderError
      }
      
      console.log('Products folder created or verified')
      
      // Test 2: Try to list files in the products folder
      console.log('Testing file listing...')
      const { data: files, error: listError } = await supabase
        .storage
        .from(bucketName)
        .list(folderName)

      if (listError) {
        console.error('List files error:', listError)
        throw listError
      }

      console.log('Files in products folder:', files)

      // Test 3: Try to upload a small test file
      console.log('Testing file upload...')
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(`${folderName}/test.txt`, testFile, {
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Test 4: Try to get public URL
      console.log('Testing public URL...')
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from(bucketName)
        .getPublicUrl(`${folderName}/test.txt`)

      if (urlError) {
        console.error('Get URL error:', urlError)
        throw urlError
      }

      console.log('Public URL:', urlData)

      // Test 5: Try to delete the test file
      console.log('Testing file deletion...')
      const { error: deleteError } = await supabase
        .storage
        .from(bucketName)
        .remove([`${folderName}/test.txt`])

      if (deleteError) {
        console.error('Delete error:', deleteError)
        throw deleteError
      }

      console.log('All storage tests passed!')
      return {
        success: true,
        message: 'All storage operations working correctly',
        bucketExists: true,
        canListFiles: true,
        canUpload: true,
        canGetUrl: true,
        canDelete: true
      }
    } catch (err) {
      console.error('Storage test failed:', err)
      return {
        success: false,
        message: err.message,
        bucketExists: false,
        canListFiles: false,
        canUpload: false,
        canGetUrl: false,
        canDelete: false
      }
    }
  }

  const uploadImage = async (file) => {
    if (!file) return null
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'File must be an image'
      return null
    }

    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `products/${fileName}`

      console.log('Uploading file to:', filePath)

      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      console.log('Upload successful, getting URL')

      const { data: urlData } = await supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      console.log('Got public URL:', urlData.publicUrl)
      uploadProgress.value = 100
      return urlData.publicUrl
    } catch (err) {
      error.value = err.message
      console.error('Image upload error:', err)
      return null
    } finally {
      uploading.value = false
    }
  }

  const deleteImage = async (url) => {
    if (!url) return
    
    try {
      const path = url.split('/').slice(-2).join('/') // extract path from URL
      
      const { error: deleteError } = await supabase
        .storage
        .from(bucketName)
        .remove([path])

      if (deleteError) {
        console.error('Failed to delete old image:', deleteError.message)
      }
    } catch (err) {
      console.error('Error deleting image:', err)
    }
  }

  return { 
    uploadImage, 
    deleteImage, 
    uploading, 
    progress: uploadProgress, 
    error,
    testStorageAccess
  }
}
