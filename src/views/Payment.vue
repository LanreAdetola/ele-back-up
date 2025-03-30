<template>
  <div class="payment-page">
    <div class="container">
      <h1>Payment</h1>
      
      <div class="checkout-content">
        <div class="payment-info">
          <h2>Payment Method</h2>
          
          <div class="payment-methods">
            <div class="method-selector">
              <label class="method-label disabled">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="creditCard" 
                  v-model="paymentMethod" 
                  disabled
                >
                <span class="method-content">
                  <span class="method-name">Credit Card</span>
                  <span class="method-icons">
                    <span class="card-icon visa">💳</span>
                    <span class="card-icon mastercard">💳</span>
                    <span class="card-icon amex">💳</span>
                  </span>
                </span>
              </label>
              
              <label class="method-label disabled">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="paypal" 
                  v-model="paymentMethod" 
                  disabled
                >
                <span class="method-content">
                  <span class="method-name">PayPal</span>
                  <span class="method-icons">
                    <span class="card-icon paypal">🅿️</span>
                  </span>
                </span>
              </label>
            </div>
          </div>
          
          <form @submit.prevent="processPayment" class="credit-card-form disabled-form">
            <div class="payment-disabled-message">
              <span class="disabled-icon">⚠️</span>
              <span>Payment processing is currently disabled in test mode.</span>
            </div>
            
            <div class="test-mode-banner">
              <span class="test-icon">🧪</span>
              <span>Test Mode: Use card number 4242 4242 4242 4242, any future date, any CVC</span>
            </div>
            
            <div class="form-group">
              <label for="cardholderName">Cardholder Name*</label>
              <input 
                type="text" 
                id="cardholderName" 
                v-model="paymentInfo.cardholderName" 
                required
                placeholder="Name as it appears on card"
              >
            </div>
            
            <div class="form-group">
              <label for="cardNumber">Card Number*</label>
              <input 
                type="text" 
                id="cardNumber" 
                v-model="paymentInfo.cardNumber" 
                required
                maxlength="19"
                placeholder="•••• •••• •••• ••••"
                @input="formatCardNumber"
              >
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="expiryDate">Expiry Date*</label>
                <input 
                  type="text" 
                  id="expiryDate" 
                  v-model="paymentInfo.expiryDate" 
                  required
                  placeholder="MM/YY"
                  maxlength="5"
                  @input="formatExpiryDate"
                >
              </div>
              
              <div class="form-group">
                <label for="cvv">CVV*</label>
                <input 
                  type="text" 
                  id="cvv" 
                  v-model="paymentInfo.cvv" 
                  required
                  placeholder="123"
                  maxlength="4"
                >
              </div>
            </div>
            
            <div class="form-group checkbox">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="paymentInfo.saveCard"
                >
                <span>Save card for future purchases</span>
              </label>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="back-button" 
                @click="goBack"
              >
                Back to Shipping
              </button>
              <button 
                type="submit" 
                class="pay-button disabled"
                disabled
              >
                <span>
                  Payments Disabled
                </span>
              </button>
            </div>
          </form>
        </div>
        
        <div class="order-summary">
          <h2>Order Summary</h2>
          
          <div class="summary-content">
            <div class="shipping-preview">
              <h3>Shipping To</h3>
              <p class="shipping-name">{{ fullName }}</p>
              <p class="shipping-address">{{ formattedAddress }}</p>
              <p class="shipping-contact">{{ shippingInfo.email }}</p>
              <p class="shipping-contact">{{ shippingInfo.phone }}</p>
              <button @click="editShipping" class="edit-button">Edit</button>
            </div>
            
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
                <span>XAF {{ orderSummary.subtotal.toFixed(2) }}</span>
              </div>
              <div class="shipping">
                <span>Shipping</span>
                <span>{{ orderSummary.shipping > 0 ? 'XAF ' + orderSummary.shipping.toFixed(2) : 'Free' }}</span>
              </div>
              <div class="taxes">
                <span>Estimated Tax</span>
                <span>XAF {{ orderSummary.tax.toFixed(2) }}</span>
              </div>
              <div class="total">
                <span>Total</span>
                <span>XAF {{ orderSummary.total.toFixed(2) }}</span>
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
const isProcessing = ref(false)

// Get cart items
const cartItems = computed(() => cartStore.items)

// Payment method selection
const paymentMethod = ref('creditCard')

// Payment information
const paymentInfo = ref({
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  saveCard: false
})

// Load shipping and order summary info from localStorage
const shippingInfo = ref({})
const orderSummary = ref({
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0
})

// Computed values for display
const fullName = computed(() => {
  return `${shippingInfo.value.firstName} ${shippingInfo.value.lastName}`
})

const formattedAddress = computed(() => {
  return `${shippingInfo.value.address}, ${shippingInfo.value.city}, ${shippingInfo.value.postalCode}, ${shippingInfo.value.country}`
})

onMounted(() => {
  cartStore.loadCart()
  
  // Load shipping info from localStorage
  const savedShippingInfo = localStorage.getItem('shippingInfo')
  if (savedShippingInfo) {
    shippingInfo.value = JSON.parse(savedShippingInfo)
  } else {
    // If no shipping info, redirect back to checkout
    router.push('/checkout')
  }
  
  // Load order summary from localStorage
  const savedOrderSummary = localStorage.getItem('orderSummary')
  if (savedOrderSummary) {
    orderSummary.value = JSON.parse(savedOrderSummary)
  }
  
  // Check if cart is empty and redirect to collection page if it is
  if (cartItems.value.length === 0) {
    router.push('/collection')
  }
})

// Format functions for credit card input
const formatCardNumber = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  let formattedValue = ''
  
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += ' '
    }
    formattedValue += value[i]
  }
  
  paymentInfo.value.cardNumber = formattedValue
}

const formatExpiryDate = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  let formattedValue = ''
  
  if (value.length > 2) {
    formattedValue = value.substring(0, 2) + '/' + value.substring(2)
  } else {
    formattedValue = value
  }
  
  paymentInfo.value.expiryDate = formattedValue
}

// Navigation functions
const goBack = () => {
  router.push('/checkout')
}

const editShipping = () => {
  router.push('/checkout')
}

// Process payment (simulated)
const processPayment = async () => {
  isProcessing.value = true
  
  try {
    // Payment is disabled
    alert('Payment processing is currently disabled in test mode.')
    return
    
    // The code below won't execute
    // Validate test card number
    if (paymentInfo.value.cardNumber.replace(/\s/g, '') !== '4242424242424242') {
      throw new Error('For testing, please use card number: 4242 4242 4242 4242')
    }
    
    // Create order in Supabase
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    
    if (!userId) {
      throw new Error('User not authenticated')
    }
    
    // Prepare order items
    const orderItems = cartItems.value.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }))
    
    // Create order record
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'processing',
        total_amount: orderSummary.value.total,
        shipping_address: {
          name: fullName.value,
          address: shippingInfo.value.address,
          city: shippingInfo.value.city,
          postal_code: shippingInfo.value.postalCode,
          country: shippingInfo.value.country,
          email: shippingInfo.value.email,
          phone: shippingInfo.value.phone
        },
        order_items: orderItems,
        payment_details: {
          method: 'credit_card',
          last_four: paymentInfo.value.cardNumber.slice(-4),
          test_mode: true
        }
      })
      .select()
    
    if (error) throw error
    
    // Clear cart
    cartStore.clearCart()
    
    // Clear localStorage data
    localStorage.removeItem('shippingInfo')
    localStorage.removeItem('orderSummary')
    
    // Redirect to confirmation page
    router.push(`/order-confirmation/${order[0].id}`)
  } catch (error) {
    console.error('Payment error:', error)
    alert(error.message || 'There was an error processing your payment. Please try again.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.payment-page {
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

.payment-info {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.method-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.method-label {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-label:hover {
  border-color: #cbd5e0;
  background-color: #f8fafc;
}

.method-label.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #f7fafc;
}

.method-label input {
  margin-right: 1rem;
}

.method-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.method-name {
  font-weight: 500;
  color: #4a5568;
}

.method-icons {
  display: flex;
  gap: 0.5rem;
}

.card-icon {
  font-size: 1.25rem;
}

.test-mode-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #ebf8ff;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #2b6cb0;
  border: 1px solid #bee3f8;
}

.test-icon {
  font-size: 1.25rem;
}

.credit-card-form {
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

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #4a5568;
  cursor: pointer;
}

label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4a5568;
}

input, select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  background-color: #f8fafc;
  color: #2d3748;
}

input:focus, select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  background-color: white;
}

input[type="checkbox"] {
  width: auto;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.back-button, .pay-button {
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

.pay-button {
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  border: none;
  flex-grow: 1;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pay-button:hover:not(:disabled) {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);
}

.pay-button:disabled {
  background: #a0aec0;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.pay-button.disabled {
  background: #a0aec0;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

.pay-button.disabled:hover {
  background: #a0aec0;
  transform: none;
  box-shadow: none;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.shipping-preview {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 0.5rem;
  position: relative;
}

.shipping-preview h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #2d3748;
}

.shipping-name {
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #4a5568;
}

.shipping-address, .shipping-contact {
  font-size: 0.95rem;
  margin: 0 0 0.5rem;
  color: #718096;
}

.edit-button {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: none;
  border: none;
  color: #3182ce;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.edit-button:hover {
  color: #2c5282;
  text-decoration: underline;
}

.summary-items {
  max-height: 200px;
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
  .payment-page {
    padding: 2rem 0;
  }
  
  h1 {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.25rem;
  }
  
  .payment-info, .order-summary {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .back-button, .pay-button {
    width: 100%;
  }
}

.disabled-form {
  position: relative;
  opacity: 0.7;
  pointer-events: none;
}

.payment-disabled-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 0.5rem;
  color: #c53030;
  font-weight: 500;
}

.disabled-icon {
  font-size: 1.25rem;
}
</style> 