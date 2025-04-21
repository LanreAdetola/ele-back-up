<template>
  <div class="admin-product-edit">
    <h1>Edit Product</h1>

    <form @submit.prevent="handleSubmit">

      <div class="form-group">
        <label>Name</label>
        <input v-model="product.name" required />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="product.description" required></textarea>
      </div>

      <div class="form-group">
        <label>Price</label>
        <input type="number" v-model="product.price" step="0.01" required />
      </div>

      <div class="form-group">
        <label>Category</label>
        <input v-model="product.category" required />
      </div>

      <!-- ✅ Image upload section -->
      <div class="form-group">
        <label>Product Image</label>
        <button type="button" @click="triggerFileInput" :disabled="uploading">
          {{ uploading ? 'Uploading...' : 'Upload New Image' }}
        </button>
        <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleImageUpload" />

        <div v-if="uploading" style="margin-top:5px;">
          <progress :value="progress" max="100" style="width:100%;"></progress>
          <small>Uploading... {{ progress }}%</small>
        </div>

        <img v-if="product.image_url" :src="product.image_url" style="max-width:100px;margin-top:5px;" />
      </div>

      <!-- Add error message display -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="product.in_stock" /> In Stock
        </label>
      </div>

      <button type="submit">Save Changes</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../../lib/supabase';
import { useImageUploader } from '../../composables/useImageUploader';

const { uploadImage, deleteImage, uploading, progress } = useImageUploader();
const route = useRoute();
const router = useRouter();
const product = ref({});
const errorMessage = ref(null);

const fetchProduct = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', route.params.id)
      .single();

    if (error) throw error;
    product.value = data;
  } catch (error) {
    console.error('Error fetching product:', error);
  }
};

const handleSubmit = async () => {
  if (uploading.value) {
    alert('Please wait for upload to finish.');
    return;
  }

  try {
    const { error } = await supabase
      .from('products')
      .update(product.value)
      .eq('id', route.params.id);

    if (error) throw error;
    router.push('/admin/products');
  } catch (error) {
    console.error('Error saving product:', error);
    errorMessage.value = `Error saving product: ${error.message}`;
  }
};

onMounted(fetchProduct);
</script>

<style scoped>
.admin-product-edit {
  padding: 2rem;
  max-width: 600px;
  margin: auto;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background: #2c5282;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin: 1rem 0;
  border: 1px solid #fed7d7;
}

.hidden {
  display: none;
}
</style>
