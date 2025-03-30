<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Checkout</h1>
      
      <div class="checkout-content">
        <div class="shipping-info">
          <h2>Shipping Information</h2>
          
          <form @submit.prevent="proceedToPayment" class="shipping-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name*</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="shippingInfo.firstName" 
                  required
                  placeholder="Enter your first name"
                >
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name*</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="shippingInfo.lastName" 
                  required
                  placeholder="Enter your last name"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">Email Address*</label>
              <input 
                type="email" 
                id="email" 
                v-model="shippingInfo.email" 
                required
                placeholder="Enter your email address"
              >
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number*</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="shippingInfo.phone" 
                required
                placeholder="Enter your phone number"
              >
            </div>
            
            <div class="form-group">
              <label for="address">Street Address*</label>
              <input 
                type="text" 
                id="address" 
                v-model="shippingInfo.address" 
                required
                placeholder="Enter your street address"
              >
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city">City*</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="shippingInfo.city" 
                  required
                  placeholder="Enter your city"
                >
              </div>
              
              <div class="form-group">
                <label for="postalCode">Postal Code*</label>
                <input 
                  type="text" 
                  id="postalCode" 
                  v-model="shippingInfo.postalCode" 
                  required
                  placeholder="Enter your postal code"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label for="country">Country*</label>
              <select 
                id="country" 
                v-model="shippingInfo.country" 
                required
              >
                <option value="" disabled selected>Select your country</option>
                <option v-for="country in countries" :key="country" :value="country">
                  {{ country }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="notes">Special Instructions (Optional)</label>
              <textarea 
                id="notes" 
                v-model="shippingInfo.notes"
                placeholder="Any special delivery instructions or notes"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="back-button" 
                @click="goBack"
              >
                Back to Cart
              </button>
              <button 
                type="submit" 
                class="continue-button"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Processing...' : 'Continue to Payment' }}
              </button>
            </div>
          </form>
        </div>
        
        <div class="order-summary">
          <h2>Order Summary</h2>
          
          <div v-if="cartItems.length === 0" class="empty-cart-message">
            <p>Your cart is empty</p>
            <router-link to="/collection" class="shop-button">Shop Now</router-link>
          </div>
          
          <div v-else class="summary-content">
            <div class="summary-items">
              <div v-for="item in cartItems" :key="item.id" class="summary-item">
                <div class="item-image">
                  <img :src="item.image_url" :alt="item.name">
                </div>
                <div class="item-details">
                  <h3>{{ item.name }}</h3>
                  <div class="item-price-qty">
                    <span class="price">XAF {{ item.price }}</span>
                    <span class="quantity">Qty: {{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="summary-totals">
              <div class="subtotal">
                <span>Subtotal</span>
                <span>XAF {{ cartTotal.toFixed(2) }}</span>
              </div>
              <div class="shipping">
                <span>Shipping</span>
                <span>{{ shipping > 0 ? 'XAF ' + shipping.toFixed(2) : 'Free' }}</span>
              </div>
              <div class="taxes">
                <span>Estimated Tax</span>
                <span>XAF {{ tax.toFixed(2) }}</span>
              </div>
              <div class="total">
                <span>Total</span>
                <span>XAF {{ orderTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import { supabase } from '../lib/supabase'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const isSubmitting = ref(false)

const cartItems = computed(() => cartStore.items)
const cartTotal = computed(() => cartStore.total)
const shipping = ref(0) // Free shipping
const tax = computed(() => cartTotal.value * 0.1) // 10% tax
const orderTotal = computed(() => cartTotal.value + shipping.value + tax.value)

// Shipping information
const shippingInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  notes: ''
})

// List of countries
const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 
  'France', 'Germany', 'Italy', 'Spain', 'Japan', 'China',
  'Brazil', 'Mexico', 'South Africa', 'Nigeria', 'India'
]

// Load user's email if available
onMounted(async () => {
  cartStore.loadCart()
  
  if (userStore.user?.email) {
    shippingInfo.value.email = userStore.user.email
  }
  
  // Check if cart is empty and redirect to collection page if it is
  if (cartItems.value.length === 0) {
    router.push('/collection')
  }
})

const goBack = () => {
  router.push('/collection')
}

const proceedToPayment = async () => {
  isSubmitting.value = true
  try {
    // Save shipping info to localStorage for now
    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo.value))
    
    // Calculate order summary
    const orderSummary = {
      subtotal: cartTotal.value,
      shipping: shipping.value,
      tax: tax.value,
      total: orderTotal.value
    }
    localStorage.setItem('orderSummary', JSON.stringify(orderSummary))
    
    // Proceed to payment
    router.push('/payment')
  } catch (error) {
    console.error('Error saving shipping info:', error)
    alert('There was an error processing your information. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
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
  margin-bottom: 2.5rem;
  color: #2d3748;
  font-size: 2.25rem;
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

.checkout-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #2d3748;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.shipping-info {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.shipping-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4a5568;
}

input, select, textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  background-color: #f8fafc;
  color: #2d3748;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  background-color: white;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.back-button, .continue-button {
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button {
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.back-button:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
}

.continue-button {
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  border: none;
  flex-grow: 1;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.2);
}

.continue-button:hover {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);
}

.continue-button:disabled {
  background: #a0aec0;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.order-summary {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  align-self: start;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-items {
  max-height: 350px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem;
}

.summary-items::-webkit-scrollbar {
  width: 6px;
}

.summary-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.summary-items::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.summary-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #edf2f7;
}

.item-image {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex-grow: 1;
}

.item-details h3 {
  font-size: 0.95rem;
  margin: 0 0 0.5rem;
  color: #2d3748;
  font-weight: 500;
}

.item-price-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 600;
  color: #3182ce;
}

.quantity {
  font-size: 0.85rem;
  color: #718096;
}

.summary-totals {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.subtotal, .shipping, .taxes, .total {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.subtotal span:first-child, 
.shipping span:first-child,
.taxes span:first-child {
  color: #718096;
}

.total {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.empty-cart-message {
  text-align: center;
  padding: 2rem 0;
  color: #718096;
}

.shop-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.shop-button:hover {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
}

@media (max-width: 1024px) {
  h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .order-summary {
    margin-top: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .checkout-page {
    padding: 2rem 0;
  }
  
  h1 {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.25rem;
  }
  
  .shipping-info, .order-summary {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .back-button, .continue-button {
    width: 100%;
  }
}
</style> 