<template>
  <div class="admin-products">
    <header class="page-header">
      <h1>{{ $t('admin.products.title') }}</h1>
      <button @click="showAddModal = true" class="add-btn">{{ $t('admin.products.addProduct') }}</button>
    </header>

    <div class="filters">
      <div class="search-box">
        <input type="text" v-model="searchQuery" :placeholder="$t('admin.products.searchPlaceholder')" />
      </div>
      <div class="filter-group">
        <select v-model="categoryFilter">
          <option value="">{{ $t('admin.products.allCategories') }}</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="stockFilter">
          <option value="">{{ $t('admin.products.allStock') }}</option>
          <option value="in_stock">{{ $t('admin.products.inStock') }}</option>
          <option value="out_of_stock">{{ $t('admin.products.outOfStock') }}</option>
        </select>
      </div>
    </div>

    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>{{ $t('admin.products.image') }}</th>
            <th>{{ $t('admin.products.name') }}</th>
            <th>{{ $t('admin.products.category') }}</th>
            <th>{{ $t('admin.products.price') }}</th>
            <th>{{ $t('admin.products.stock') }}</th>
            <th>{{ $t('admin.products.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td><img :src="product.image_url" class="product-thumbnail" /></td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>XAF {{ product.price.toFixed(2) }}</td>
            <td>
              <span :class="['stock-badge', product.in_stock ? 'in-stock' : 'out-of-stock']">
                {{ product.in_stock ? $t('admin.products.inStock') : $t('admin.products.outOfStock') }}
              </span>
            </td>
            <td>
              <button @click="editProduct(product)" class="edit-btn">{{ $t('admin.products.edit') }}</button>
              <button @click="deleteProduct(product.id)" class="delete-btn">{{ $t('admin.products.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add / Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal">
      <div class="modal-content">
        <h2>{{ showEditModal ? $t('admin.products.editProduct') : $t('admin.products.addProduct') }}</h2>
        <form @submit.prevent="handleSubmit">

          <div class="form-group">
            <label>{{ $t('admin.products.name') }}</label>
            <input v-model="productForm.name" required />
          </div>

          <div class="form-group">
            <label>{{ $t('admin.products.description') }}</label>
            <textarea v-model="productForm.description" required></textarea>
          </div>

          <div class="form-group">
            <label>{{ $t('admin.products.price') }}</label>
            <input type="number" v-model="productForm.price" step="0.01" required />
          </div>

          <div class="form-group">
            <label>{{ $t('admin.products.category') }}</label>
            <select v-model="productForm.category" required>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- ✅ IMAGE UPLOAD -->
          <div class="form-group">
            <label>{{ $t('admin.products.image') }}</label>
            <button type="button" @click="triggerFileInput" :disabled="uploading">
              {{ uploading ? 'Uploading...' : 'Upload Image' }}
            </button>
            <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleImageUpload" :required="!showEditModal" />

            <div v-if="uploading" style="margin-top:5px;">
              <progress :value="progress" max="100" style="width:100%;"></progress>
              <small>Uploading... {{ progress }}%</small>
            </div>

            <img v-if="productForm.image" :src="productForm.image" style="max-width:120px;margin-top:5px;" />
          </div>

          <!-- Add error message display -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="productForm.in_stock" /> {{ $t('admin.products.inStock') }}
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">{{ $t('admin.products.cancel') }}</button>
            <button type="submit" class="save-btn">{{ $t('admin.products.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useImageUploader } from '../../composables/useImageUploader'

const { uploadImage, deleteImage, uploading, progress } = useImageUploader()
const fileInput = ref(null)

const products = ref([])
const categories = ref(['Rings', 'Necklaces', 'Earrings', 'Bracelets'])
const searchQuery = ref('')
const categoryFilter = ref('')
const stockFilter = ref('')

const showAddModal = ref(false)
const showEditModal = ref(false)

const productForm = ref({
  id: null,                // ✅ you need this for edit mode
  name: '',
  description: '',
  price: 0,
  category: '',
  image_url: '',            // ✅ correct naming for final image url
  in_stock: true
})

const errorMessage = ref(null)

const triggerFileInput = () => {
  if (!uploading.value) fileInput.value?.click()
}

const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (!error) products.value = data
}

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !categoryFilter.value || product.category === categoryFilter.value
    const matchesStock = !stockFilter.value || (stockFilter.value === 'in_stock' && product.in_stock) || (stockFilter.value === 'out_of_stock' && !product.in_stock)
    return matchesSearch && matchesCategory && matchesStock
  })
})

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file || uploading.value) return

  // Clear any previous errors
  errorMessage.value = null

  try {
    // If we're editing and there's an existing image, delete it
    if (showEditModal.value && productForm.value.image_url) {
      await deleteImage(productForm.value.image_url)
    }

    // Upload the new image
    const url = await uploadImage(file)
    if (url) {
      productForm.value.image_url = url
      productForm.value.image = url // For preview
      console.log("Image uploaded successfully:", url)
    } else {
      console.error("Upload failed - no URL returned")
      errorMessage.value = "Image upload failed"
    }
  } catch (error) {
    console.error("Image upload error:", error)
    errorMessage.value = `Error uploading image: ${error.message}`
  }
}

const editProduct = (product) => {
  productForm.value = { ...product }
  showEditModal.value = true
}

const deleteProduct = async (id) => {
  if (confirm('Delete this product?')) {
    await supabase.from('products').delete().eq('id', id)
    await fetchProducts()
  }
}

const handleSubmit = async () => {
  if (uploading.value) {
    alert('Please wait for the image to finish uploading.')
    return
  }

  try {
    errorMessage.value = null

    // Make sure we have an image for new products
    if (!showEditModal.value && !productForm.value.image_url) {
      errorMessage.value = "Please upload an image"
      return
    }

    const data = {
      name: productForm.value.name,
      description: productForm.value.description,
      price: parseFloat(productForm.value.price),
      category: productForm.value.category,
      image_url: productForm.value.image_url,
      in_stock: productForm.value.in_stock
    }

    if (showEditModal.value) {
      const { error } = await supabase.from('products').update(data).eq('id', productForm.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('products').insert(data)
      if (error) throw error
    }

    closeModal()
    await fetchProducts()
  } catch (error) {
    console.error("Error saving product:", error)
    errorMessage.value = `Error saving product: ${error.message}`
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  productForm.value = {
    id: null,
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    in_stock: true
  }
}

onMounted(fetchProducts)
</script>

<style scoped>
.admin-products {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.page-header h1 {
  margin: 0;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
}

.add-btn {
  background-color: #4299e1;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-btn:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  flex: 1;
  min-width: 280px;
}

.search-box input {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f7fafc;
  transition: all 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.filter-group {
  display: flex;
  gap: 0.8rem;
}

.filter-group select {
  padding: 0.6rem 2rem 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f7fafc;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%234a5568'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  appearance: none;
  color: #4a5568;
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 150px;
}

.filter-group select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.products-table {
  overflow-x: auto;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  background-color: #f7fafc;
  position: sticky;
  top: 0;
  z-index: 1;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  vertical-align: middle;
}

tr:hover {
  background-color: #f7fafc;
}

.product-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #e2e8f0;
}

.stock-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.in-stock {
  color: #2f855a;
  background-color: #c6f6d5;
}

.out-of-stock {
  color: #c53030;
  background-color: #fed7d7;
}

.edit-btn, .delete-btn {
  padding: 0.4rem 0.8rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: #4299e1;
  color: white;
}

.edit-btn:hover {
  background-color: #3182ce;
}

.delete-btn {
  background-color: #f56565;
  color: white;
}

.delete-btn:hover {
  background-color: #e53e3e;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
  position: relative;
}

.modal-content h2 {
  margin-top: 0;
  color: #2d3748;
  font-size: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-group input, 
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #f7fafc;
  transition: all 0.2s ease;
}

.form-group input:focus, 
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin-right: 0.5rem;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 0.6rem 1.2rem;
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #cbd5e0;
}

.save-btn {
  padding: 0.6rem 1.2rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background-color: #3182ce;
}

.hidden {
  display: none;
}

.error-message {
  color: #c53030;
  background-color: #fff5f5;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
  border: 1px solid #fed7d7;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-products {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
  
  .filter-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-group select {
    flex: 1;
  }
  
  th, td {
    padding: 0.75rem 0.5rem;
  }
  
  .product-thumbnail {
    width: 50px;
    height: 50px;
  }

  .edit-btn, .delete-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
  }
}
</style>
