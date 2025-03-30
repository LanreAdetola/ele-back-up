<template>
  <div class="product-detail">
    <div class="container">
      <div v-if="product" class="product-content">
        <div class="product-image">
          <img :src="product.image_url" :alt="product.name">
        </div>
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <p class="price">XAF {{ product.price }}</p>
          <p class="description">{{ product.description }}</p>
          <div class="product-actions">
            <button 
              class="add-to-cart" 
              @click="addToCart"
              :disabled="isAddingToCart"
              :class="{ 'login-prompt': !isLoggedIn }"
            >
              {{ isAddingToCart ? 'Adding...' : (isLoggedIn ? 'Add to Cart' : 'Sign in to Buy') }}
            </button>
            <button 
              class="continue-shopping" 
              @click="goToCollection"
            >
              Continue Shopping
            </button>
          </div>
          <p v-if="addToCartMessage" :class="['message', addToCartMessage.type]">
            {{ addToCartMessage.text }}
          </p>
        </div>
      </div>
      <div v-else class="loading">
        Loading...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import { supabase } from '../lib/supabase'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const product = ref(null)
const isAddingToCart = ref(false)
const addToCartMessage = ref(null)
const isLoggedIn = computed(() => !!userStore.user)

const fetchProduct = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    product.value = data
  } catch (error) {
    console.error('Error fetching product:', error)
  }
}

const showMessage = (text, type = 'success') => {
  addToCartMessage.value = { text, type }
  setTimeout(() => {
    addToCartMessage.value = null
  }, 3000)
}

const addToCart = () => {
  if (!product.value) return
  
  // Check if user is logged in
  if (!isLoggedIn.value) {
    if (confirm('Please log in to add items to your cart. Would you like to log in now?')) {
      router.push('/login')
    }
    return
  }
  
  isAddingToCart.value = true
  try {
    const productToAdd = {
      id: product.value.id,
      name: product.value.name,
      price: parseFloat(product.value.price),
      image_url: product.value.image_url
    }
    
    cartStore.addItem(productToAdd)
    console.log("Added to cart:", productToAdd)
    showMessage('Added to cart successfully!')
  } catch (error) {
    console.error("Error adding to cart:", error)
    showMessage('Failed to add to cart', 'error')
  } finally {
    isAddingToCart.value = false
  }
}

const goToCollection = () => {
  router.push('/collection')
}

onMounted(() => {
  fetchProduct()
  userStore.checkUser()
})
</script>

<style scoped>
.product-detail {
  padding: 2rem 0;
  min-height: 100vh;
  background-color: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.product-image img {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  max-height: 550px;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.product-image img:hover {
  transform: scale(1.02);
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-info h1 {
  margin: 0 0 1rem;
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #3182ce;
  margin: 1.25rem 0;
  display: flex;
  align-items: center;
}

.price::before {
  content: 'XAF';
  font-size: 1.2rem;
  position: relative;
  top: -0.3rem;
  margin-right: 0.15rem;
}

.description {
  color: #4a5568;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  font-size: 1.05rem;
  flex-grow: 1;
}

.product-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  margin-bottom: 1rem;
}

.add-to-cart {
  flex: 2;
  padding: 0.875rem 2rem;
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);
}

.add-to-cart:hover:not(:disabled) {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(66, 153, 225, 0.3);
}

.add-to-cart:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.continue-shopping {
  flex: 1;
  padding: 0.875rem 1.5rem;
  background-color: #f7fafc;
  color: #3182ce;
  border: 2px solid #3182ce;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background-color: #ebf8ff;
  border-color: #2c5282;
  color: #2c5282;
  transform: translateY(-2px);
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.success {
  background: #c6f6d5;
  color: #2f855a;
  border: 1px solid #9ae6b4;
}

.message.error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: #4a5568;
}

.loading::after {
  content: "";
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid #cbd5e0;
  border-radius: 50%;
  border-top-color: #3182ce;
  animation: spin 1s linear infinite;
  margin-left: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .product-detail {
    padding: 1rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .product-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
  }

  .product-image img {
    max-height: 350px;
  }

  .product-info h1 {
    font-size: 1.6rem;
  }

  .price {
    font-size: 1.6rem;
    margin: 1rem 0;
  }

  .description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .product-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .add-to-cart,
  .continue-shopping {
    width: 100%;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .product-content {
    padding: 1.25rem;
    border-radius: 0.5rem;
  }

  .product-image img {
    max-height: 300px;
    border-radius: 0.375rem;
  }

  .product-info h1 {
    font-size: 1.4rem;
  }

  .price {
    font-size: 1.4rem;
  }

  .description {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .add-to-cart,
  .continue-shopping {
    padding: 0.7rem 1.25rem;
    font-size: 0.95rem;
    border-radius: 0.375rem;
  }
}

.add-to-cart.login-prompt {
  background: white;
  color: #3182ce;
  border: 2px solid #4299e1;
  position: relative;
  overflow: hidden;
}

.add-to-cart.login-prompt:hover {
  background: #ebf8ff;
}

.add-to-cart.login-prompt::before {
  content: '👤';
  margin-right: 0.5rem;
  font-size: 1.1rem;
}
</style> 