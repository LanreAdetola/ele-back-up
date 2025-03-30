<template>
  <div class="cart" v-if="isOpen">
    <div class="cart-content">
      <div class="cart-header">
        <h2>Shopping Cart</h2>
        <button class="close-button" @click="closeCart" aria-label="Close cart">&times;</button>
      </div>
      
      <div v-if="items.length === 0" class="empty-cart">
        <p>Your cart is empty</p>
        <button class="continue-shopping" @click="closeCart">Continue Shopping</button>
      </div>
      
      <div v-else class="cart-items">
        <div v-for="item in items" :key="item.id" class="cart-item">
          <div class="item-image">
            <img :src="item.image_url" :alt="item.name">
          </div>
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="price">XAF {{ item.price }}</p>
            <div class="quantity-controls">
              <button @click="updateQuantity(item.id, -1)" class="quantity-btn" aria-label="Decrease quantity">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button @click="updateQuantity(item.id, 1)" class="quantity-btn" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="remove-button" @click="removeItem(item.id)" aria-label="Remove item">&times;</button>
        </div>
      </div>
      
      <div v-if="items.length > 0" class="cart-footer">
        <div class="total">
          <span>Total:</span>
          <span>XAF {{ total.toFixed(2) }}</span>
        </div>
        <div class="cart-actions">
          <button class="continue-shopping" @click="closeCart">Continue Shopping</button>
          <button class="checkout-button" @click="handleCheckout">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
const router = useRouter()
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'updateCount'])

const items = computed(() => cartStore.items)
const total = computed(() => cartStore.total)

const closeCart = () => {
  emit('close')
}

const updateQuantity = (productId, change) => {
  cartStore.updateQuantity(productId, change)
}

const removeItem = (productId) => {
  cartStore.removeItem(productId)
}

const handleCheckout = () => {
  router.push('/checkout')
  closeCart()
}

onMounted(() => {
  cartStore.loadCart()
})

// Expose methods to parent components
defineExpose({
  addItem: (product) => {
    cartStore.addItem(product)
    emit('updateCount', cartStore.itemCount)
  }
})
</script>

<style scoped>
.cart {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: white;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.cart-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: #f7fafc;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4a5568;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #edf2f7;
  color: #2d3748;
}

.empty-cart {
  padding: 3rem 2rem;
  text-align: center;
  color: #718096;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  flex-grow: 1;
  justify-content: center;
}

.empty-cart::before {
  content: '🛒';
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.continue-shopping {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
}

.continue-shopping:hover {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  -webkit-overflow-scrolling: touch;
  background-color: #f8fafc;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 0.5rem;
  background-color: white;
  margin-bottom: 1rem;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.item-image {
  flex-shrink: 0;
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  background-color: #f7fafc;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-details h3 {
  margin: 0 0 0.5rem;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  color: #3182ce;
  font-weight: 600;
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.quantity-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  color: #4a5568;
  transition: all 0.2s ease;
}

.quantity-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  color: #2d3748;
}

.quantity {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.remove-button {
  background: #f7fafc;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #a0aec0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  transition: all 0.2s ease;
}

.remove-button:hover {
  background: #fed7d7;
  color: #e53e3e;
}

.cart-footer {
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: white;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.05);
}

.total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.cart-actions {
  display: flex;
  gap: 0.75rem;
}

.continue-shopping {
  flex: 1;
  padding: 0.875rem 1rem;
  background: #f7fafc;
  color: #3182ce;
  border: 2px solid #3182ce;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background: #ebf8ff;
  border-color: #2c5282;
  color: #2c5282;
}

.checkout-button {
  flex: 2;
  padding: 0.875rem 1rem;
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
}

.checkout-button:hover {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);
}

@media (max-width: 480px) {
  .cart {
    max-width: 100%;
  }

  .cart-content {
    padding-bottom: 80px;
  }

  .cart-header {
    padding: 1rem;
  }

  .cart-header h2 {
    font-size: 1.1rem;
  }

  .close-button {
    width: 36px;
    height: 36px;
    font-size: 1.3rem;
  }

  .cart-items {
    padding: 1rem;
  }

  .cart-item {
    padding: 1rem;
  }

  .item-image img {
    width: 70px;
    height: 70px;
  }

  .item-details h3 {
    font-size: 0.95rem;
  }

  .price {
    font-size: 0.9rem;
  }

  .quantity-btn {
    width: 30px;
    height: 30px;
  }

  .remove-button {
    width: 30px;
    height: 30px;
    top: 0.5rem;
    right: 0.5rem;
  }

  .cart-footer {
    padding: 1rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .cart-actions {
    flex-direction: column;
  }

  .continue-shopping,
  .checkout-button {
    width: 100%;
    padding: 0.75rem 1rem;
  }
}
</style> 