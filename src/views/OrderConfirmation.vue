<template>
  <div class="confirmation-page">
    <div class="container">
      <div class="confirmation-content">
        <div class="success-animation">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        
        <h1>Order Confirmed!</h1>
        <p class="thank-you">Thank you for your purchase.</p>
        
        <div class="order-info">
          <div class="order-number">
            <span>Order Number:</span>
            <span>{{ order?.id || 'Processing...' }}</span>
          </div>
          <div class="order-date">
            <span>Order Date:</span>
            <span>{{ formatDate(order?.created_at) }}</span>
          </div>
        </div>
        
        <div class="confirmation-details">
          <div class="details-section shipping-details">
            <h2>Shipping Details</h2>
            <div v-if="order" class="detail-content">
              <p class="detail-name">{{ order.shipping_address.name }}</p>
              <p class="detail-address">{{ order.shipping_address.address }}</p>
              <p class="detail-city">{{ order.shipping_address.city }}, {{ order.shipping_address.postal_code }}</p>
              <p class="detail-country">{{ order.shipping_address.country }}</p>
              <p class="detail-contact">{{ order.shipping_address.email }}</p>
              <p class="detail-contact">{{ order.shipping_address.phone }}</p>
            </div>
            <div v-else class="loading-placeholder">
              <div class="placeholder-line"></div>
              <div class="placeholder-line"></div>
              <div class="placeholder-line"></div>
            </div>
          </div>
          
          <div class="details-section payment-details">
            <h2>Payment Details</h2>
            <div v-if="order" class="detail-content">
              <p class="detail-method">
                <span class="label">Method:</span>
                <span class="value">Credit Card</span>
              </p>
              <p class="detail-card">
                <span class="label">Card:</span>
                <span class="value">•••• •••• •••• {{ order.payment_details?.last_four }}</span>
              </p>
              <p class="detail-status">
                <span class="label">Status:</span>
                <span class="value status-paid">Paid</span>
              </p>
              <p class="detail-amount">
                <span class="label">Amount:</span>
                <span class="value">XAF {{ order.total_amount.toFixed(2) }}</span>
              </p>
            </div>
            <div v-else class="loading-placeholder">
              <div class="placeholder-line"></div>
              <div class="placeholder-line"></div>
              <div class="placeholder-line"></div>
            </div>
          </div>
        </div>
        
        <div class="order-items">
          <h2>Order Items</h2>
          <div v-if="order" class="items-list">
            <div v-for="item in order.order_items" :key="item.product_id" class="item">
              <div class="item-details">
                <h3>{{ item.name }}</h3>
                <div class="item-meta">
                  <span class="item-price">XAF {{ item.price }}</span>
                  <span class="item-quantity">Qty: {{ item.quantity }}</span>
                </div>
              </div>
              <div class="item-total">XAF {{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
          <div v-else class="loading-placeholder items-placeholder">
            <div class="placeholder-line"></div>
            <div class="placeholder-line"></div>
            <div class="placeholder-line"></div>
          </div>
          
          <div v-if="order" class="order-summary">
            <div class="summary-row subtotal">
              <span>Subtotal</span>
              <span>XAF {{ calculateSubtotal().toFixed(2) }}</span>
            </div>
            <div class="summary-row tax">
              <span>Estimated Tax</span>
              <span>XAF {{ (order.total_amount - calculateSubtotal()).toFixed(2) }}</span>
            </div>
            <div class="summary-row shipping">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>XAF {{ order.total_amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="confirmation-actions">
          <div class="shipping-note">
            <span class="icon">📦</span>
            <p>Your order will be processed within 2 business days. We'll send you a shipping confirmation email once your order is on its way.</p>
          </div>
          
          <div class="action-buttons">
            <router-link to="/collection" class="continue-shopping">Continue Shopping</router-link>
            <button @click="printReceipt" class="print-receipt">
              <span class="print-icon">🖨️</span>
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const error = ref(null)

onMounted(async () => {
  await fetchOrder()
})

const fetchOrder = async () => {
  try {
    const orderId = route.params.id
    
    if (!orderId) {
      router.push('/collection')
      return
    }
    
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      router.push('/login')
      return
    }
    
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userData.user.id)
      .single()
    
    if (fetchError) throw fetchError
    
    if (!data) {
      router.push('/collection')
      return
    }
    
    order.value = data
  } catch (err) {
    console.error('Error fetching order:', err)
    error.value = err.message
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const calculateSubtotal = () => {
  if (!order.value || !order.value.order_items) return 0
  
  return order.value.order_items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
}

const printReceipt = () => {
  window.print()
}
</script>

<style scoped>
.confirmation-page {
  padding: 3rem 0;
  min-height: 100vh;
  background-color: #f8fafc;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.confirmation-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-animation {
  margin-bottom: 1.5rem;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #3182ce;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #3182ce;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #3182ce;
  fill: none;
  animation: stroke .6s cubic-bezier(0.650, 0.000, 0.450, 1.000) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke .3s cubic-bezier(0.650, 0.000, 0.450, 1.000) .8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0 0 0 50px #fff;
  }
}

h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem;
  text-align: center;
}

.thank-you {
  color: #718096;
  font-size: 1.1rem;
  text-align: center;
  margin: 0 0 2rem;
}

.order-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  justify-content: center;
}

.order-number, .order-date {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-number span:first-child, .order-date span:first-child {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.order-number span:last-child, .order-date span:last-child {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.confirmation-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  margin-bottom: 2rem;
}

.details-section {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-name {
  font-weight: 600;
  color: #4a5568;
  margin: 0;
}

.detail-address, .detail-city, .detail-country, .detail-contact {
  font-size: 0.95rem;
  color: #718096;
  margin: 0;
}

.detail-method, .detail-card, .detail-status, .detail-amount {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.label {
  color: #718096;
  font-size: 0.95rem;
}

.value {
  font-weight: 500;
  color: #4a5568;
}

.status-paid {
  color: #48bb78;
  font-weight: 600;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.placeholder-line {
  height: 1rem;
  background: linear-gradient(to right, #e2e8f0 0%, #edf2f7 50%, #e2e8f0 100%);
  background-size: 200% 100%;
  animation: placeholderAnimation 1.5s infinite;
  border-radius: 0.25rem;
}

.placeholder-line:nth-child(1) {
  width: 90%;
}

.placeholder-line:nth-child(2) {
  width: 80%;
}

.placeholder-line:nth-child(3) {
  width: 70%;
}

@keyframes placeholderAnimation {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 100% 0;
  }
}

.order-items {
  width: 100%;
  margin-bottom: 2rem;
}

.items-list {
  margin-bottom: 1.5rem;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.item:last-child {
  border-bottom: none;
}

.item-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 500;
  color: #2d3748;
}

.item-meta {
  display: flex;
  gap: 1rem;
  color: #718096;
  font-size: 0.95rem;
}

.item-total {
  font-weight: 600;
  color: #3182ce;
  font-size: 1.05rem;
}

.items-placeholder {
  padding: 1rem 0;
}

.order-summary {
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.confirmation-actions {
  width: 100%;
  margin-top: 1rem;
}

.shipping-note {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background-color: #ebf8ff;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid #bee3f8;
}

.shipping-note .icon {
  font-size: 1.5rem;
  line-height: 1;
}

.shipping-note p {
  margin: 0;
  color: #2b6cb0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.continue-shopping, .print-receipt {
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  font-size: 0.95rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.continue-shopping {
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.2);
}

.continue-shopping:hover {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);
}

.print-receipt {
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.print-receipt:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
}

.print-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .confirmation-details {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .order-info {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .confirmation-content {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.75rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .shipping-note {
    padding: 1rem;
  }
}

@media print {
  .confirmation-actions {
    display: none;
  }
  
  .confirmation-content {
    box-shadow: none;
    padding: 0;
  }
  
  .confirmation-page {
    background-color: white;
    padding: 0;
  }
  
  .container {
    max-width: 100%;
    padding: 0;
  }
}
</style> 