<template>
  <div class="collection">
    <div class="container">
      <h1>Our Products</h1>
      
      <!-- Products Grid -->
      <div class="products-grid">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="product-card"
        >
          <div class="product-image" @click="viewProduct(product.id)">
            <img :src="product.image_url" :alt="product.name">
            <!-- Status Badges -->
            <div class="status-badges">
              <span v-if="isNew(product)" class="badge new-badge">New</span>
            </div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">XAF {{ product.price }}</p>
            <p class="description">{{ product.description }}</p>
            
            <!-- Action Buttons -->
            <div class="product-actions">
              <button 
                class="action-button view-button" 
                @click="viewProduct(product.id)"
              >
                View Details
              </button>
              
              <div class="user-actions">
                <button 
                  class="action-button cart-button" 
                  @click.stop="addToCart(product)"
                  title="Add to Cart"
                  :class="{ 'login-required': !isLoggedIn }"
                >
                  <i class="cart-icon">🛒</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const products = ref([])
const isLoggedIn = computed(() => !!userStore.user)

// Fetch products from Supabase
const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    products.value = data
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

// View product details
const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// Add to cart functionality
const addToCart = (product) => {
  if (!isLoggedIn.value) {
    showLoginPrompt()
    return
  }
  
  try {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image_url: product.image_url
    }
    cartStore.addItem(productToAdd)
    showToast('Added to cart')
  } catch (error) {
    console.error("Error adding to cart:", error)
    showToast('Failed to add to cart', 'error')
  }
}

// Check if product is new (last 7 days)
const isNew = (product) => {
  if (!product.created_at) return false
  const createdDate = new Date(product.created_at)
  const now = new Date()
  const diffTime = Math.abs(now - createdDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

// Go to login page
const goToLogin = () => {
  router.push('/login')
}

// Show login prompt
const showLoginPrompt = () => {
  if (confirm('Please log in to continue. Would you like to log in now?')) {
    goToLogin()
  }
}

// Toast notification (simple implementation)
const showToast = (message, type = 'success') => {
  // You can implement a proper toast system or use an existing one
  alert(message)
}

// Initial fetch
onMounted(() => {
  fetchProducts()
  // Check user
  userStore.checkUser()
})
</script>

<style scoped>
.collection {
  padding: 3rem 0;
  min-height: 100vh;
  background-color: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

h1 {
  text-align: center;
  margin-bottom: 3rem;
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, #3182ce, #4299e1);
  border-radius: 3px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.product-image {
  position: relative;
  overflow: hidden;
  height: 240px;
}

.product-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover img {
  transform: scale(1.05);
}

.product-info {
  padding: 1.5rem;
}

.product-info h3 {
  margin: 0 0 0.75rem;
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
}

.price {
  font-weight: 700;
  color: #3182ce;
  margin: 0.75rem 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.price::before {
  content: '$';
  font-size: 0.85rem;
  vertical-align: top;
  margin-right: 0.1rem;
}

.description {
  color: #718096;
  font-size: 0.95rem;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-button {
  background: #ebf8ff;
  color: #3182ce;
  border: 1px solid #bee3f8;
  flex-grow: 1;
  margin-right: 0.5rem;
}

.view-button:hover {
  background: #bee3f8;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.cart-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.cart-button:hover {
  background: #ebf8ff;
  border-color: #bee3f8;
}

.login-required {
  position: relative;
}

.login-required::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.login-required:hover::before {
  content: '👤';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(66, 153, 225, 0.9);
  color: white;
  font-size: 1.2rem;
  z-index: 2;
}

.cart-icon {
  font-size: 1rem;
  line-height: 1;
}

.status-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.new-badge {
  background: #c6f6d5;
  color: #2f855a;
}

@media (max-width: 768px) {
  .collection {
    padding: 2rem 0;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .product-image {
    height: 200px;
  }
}
</style> 