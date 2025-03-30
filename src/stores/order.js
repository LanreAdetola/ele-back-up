import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useCartStore } from './cart'

export const useOrderStore = defineStore('order', () => {
  const cartStore = useCartStore()
  const currentOrder = ref(null)
  const orderStatus = ref('pending')
  const loading = ref(false)
  const error = ref(null)
  const shippingInfo = ref(null)
  
  // Save shipping information to local storage
  const saveShippingInfo = (info) => {
    shippingInfo.value = info
    localStorage.setItem('shippingInfo', JSON.stringify(info))
  }
  
  // Load shipping information from local storage
  const loadShippingInfo = () => {
    const savedInfo = localStorage.getItem('shippingInfo')
    if (savedInfo) {
      shippingInfo.value = JSON.parse(savedInfo)
    }
    return shippingInfo.value
  }
  
  // Clear shipping information
  const clearShippingInfo = () => {
    shippingInfo.value = null
    localStorage.removeItem('shippingInfo')
  }
  
  // Create a new order
  const createOrder = async (paymentDetails) => {
    loading.value = true
    error.value = null
    
    try {
      // Make sure we have the necessary data
      if (!shippingInfo.value) {
        throw new Error('Shipping information is required')
      }
      
      if (cartStore.items.length === 0) {
        throw new Error('Cart is empty')
      }
      
      // Get the current user
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('User must be logged in to place an order')
      }
      
      // Create the order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.user.id,
          total_amount: cartStore.total,
          shipping_address: shippingInfo.value,
          payment_details: paymentDetails || {},
          status: 'paid' // In a real system, this would depend on payment confirmation
        })
        .select()
        .single()
      
      if (orderError) throw orderError
      
      // Add order items
      const orderItems = cartStore.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url
      }))
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) throw itemsError
      
      // Set the current order
      currentOrder.value = order
      
      // Clear the cart
      cartStore.clearCart()
      
      // Clear shipping info (optional - could keep for repeat purchases)
      // clearShippingInfo()
      
      return order
    } catch (err) {
      console.error('Error creating order:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Get order by ID
  const getOrderById = async (orderId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .single()
      
      if (fetchError) throw fetchError
      
      currentOrder.value = data
      return data
    } catch (err) {
      console.error('Error fetching order:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Get all orders for the current user
  const getUserOrders = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('User must be logged in to view orders')
      }
      
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      return data
    } catch (err) {
      console.error('Error fetching user orders:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }
  
  return {
    currentOrder,
    orderStatus,
    loading,
    error,
    shippingInfo,
    saveShippingInfo,
    loadShippingInfo,
    clearShippingInfo,
    createOrder,
    getOrderById,
    getUserOrders
  }
}) 