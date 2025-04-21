<template>
  <div class="admin-orders">
    <div class="page-header">
      <h1>Orders Management</h1>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label for="status-filter">Status</label>
        <select id="status-filter" v-model="statusFilter">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="date-filter">Date Range</label>
        <select id="date-filter" v-model="dateFilter">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>
      
      <div class="search-group">
        <input type="text" v-model="searchQuery" placeholder="Search by order ID or customer...">
        <button class="search-btn" @click="searchOrders">Search</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading orders...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchOrders" class="retry-btn">Retry</button>
    </div>
    
    <div v-else-if="!orders || orders.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h2>No Orders Found</h2>
      <p>There are no orders matching your filters.</p>
      <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
    </div>
    
    <div v-else class="orders-table">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id" class="order-row">
            <td class="order-id">{{ formatOrderId(order.id) }}</td>
            <td class="customer">
              <div v-if="order.customer">{{ order.customer }}</div>
              <div v-else-if="order.shipping_address && order.shipping_address.name">
                {{ order.shipping_address.name }}
              </div>
              <div v-else>Unknown</div>
            </td>
            <td class="date">{{ formatDate(order.created_at) }}</td>
            <td class="items">{{ getItemsCount(order) }}</td>
            <td class="total">XAF {{ Number(order.total_amount).toFixed(2) }}</td>
            <td class="status">
              <span :class="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
            </td>
            <td class="actions">
              <button class="view-btn" @click="viewOrder(order)">View</button>
              <select v-model="order.status" @change="updateOrderStatus(order)" :disabled="updatingOrderId === order.id">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="currentPage--" 
          class="pagination-btn"
        >
          Previous
        </button>
        
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        
        <button 
          :disabled="currentPage === totalPages" 
          @click="currentPage++" 
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
    
    <div v-if="selectedOrder" class="order-details-modal">
      <div class="modal-overlay" @click="closeOrderDetails"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Order Details</h2>
          <button class="close-modal-btn" @click="closeOrderDetails">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="order-header">
            <div class="order-number">
              <h3>Order #{{ formatOrderId(selectedOrder.id) }}</h3>
              <p class="order-date">{{ formatDate(selectedOrder.created_at) }}</p>
            </div>
            
            <div class="order-status">
              <span :class="'status-badge status-' + selectedOrder.status.toLowerCase()">
                {{ selectedOrder.status }}
              </span>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="customer-info">
              <h4>Customer Information</h4>
              <div v-if="selectedOrder.shipping_address">
                <p class="name">{{ selectedOrder.shipping_address.name }}</p>
                <p class="email">{{ selectedOrder.shipping_address.email }}</p>
                <p class="phone">{{ selectedOrder.shipping_address.phone }}</p>
              </div>
            </div>
            
            <div class="shipping-info">
              <h4>Shipping Address</h4>
              <div v-if="selectedOrder.shipping_address">
                <p>{{ selectedOrder.shipping_address.address }}</p>
                <p>{{ selectedOrder.shipping_address.city }}, {{ selectedOrder.shipping_address.postal_code }}</p>
                <p>{{ selectedOrder.shipping_address.country }}</p>
              </div>
            </div>
            
            <div class="payment-info">
              <h4>Payment Information</h4>
              <div v-if="selectedOrder.payment_details">
                <p class="payment-method">
                  <span class="label">Method:</span>
                  <span>Credit Card</span>
                </p>
                <p class="card-info" v-if="selectedOrder.payment_details.last_four">
                  <span class="label">Card:</span>
                  <span>•••• •••• •••• {{ selectedOrder.payment_details.last_four }}</span>
                </p>
                <p class="payment-status">
                  <span class="label">Status:</span>
                  <span class="status-paid">Paid</span>
                </p>
              </div>
              <div v-else>
                <p>Payment details not available</p>
              </div>
            </div>
          </div>
          
          <div class="order-items">
            <h4>Items</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orderItems" :key="item.id">
                  <td class="product-info">
                    <div class="product-image" v-if="item.image_url">
                      <img :src="item.image_url" :alt="item.name">
                    </div>
                    <div class="product-name">{{ item.name }}</div>
                  </td>
                  <td class="price">XAF {{ Number(item.price).toFixed(2) }}</td>
                  <td class="quantity">{{ item.quantity }}</td>
                  <td class="item-total">XAF {{ (Number(item.price) * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="subtotal-label">Subtotal</td>
                  <td class="subtotal-value">XAF {{ calculateSubtotal().toFixed(2) }}</td>
                </tr>
                <tr>
                  <td colspan="3" class="shipping-label">Shipping</td>
                  <td class="shipping-value">Free</td>
                </tr>
                <tr>
                  <td colspan="3" class="total-label">Total</td>
                  <td class="total-value">XAF {{ Number(selectedOrder.total_amount).toFixed(2) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="order-actions">
            <div class="status-update">
              <label for="update-status">Update Status:</label>
              <select id="update-status" v-model="selectedOrder.status">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button class="update-status-btn" @click="updateOrderStatus(selectedOrder)" :disabled="updatingOrderId === selectedOrder.id">
                Update
              </button>
            </div>
            
            <button class="print-btn" @click="printOrder">
              <span class="print-icon">🖨️</span>
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';

const orders = ref([]);
const statusFilter = ref('');
const dateFilter = ref('all');
const searchQuery = ref('');
const loading = ref(false);
const error = ref(null);

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*');

    if (fetchError) throw fetchError;
    orders.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.admin-orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.25rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.filter-group, .search-group {
  display: flex;
  flex-direction: column;
}

.filter-group {
  min-width: 200px;
}

.search-group {
  flex-grow: 1;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

select, input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  color: #2d3748;
  background-color: white;
}

select:focus, input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.search-btn {
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-btn:hover {
  background-color: #3182ce;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 153, 225, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4299e1;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  background-color: #fff5f5;
  border-radius: 0.5rem;
  border: 1px solid #fed7d7;
  color: #c53030;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background-color: #c53030;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: #718096;
}

.clear-filters-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-filters-btn:hover {
  background-color: #3182ce;
}

.orders-table {
  overflow-x: auto;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  font-weight: 600;
  color: #4a5568;
  background-color: #f7fafc;
}

.order-row:hover {
  background-color: #f7fafc;
}

.order-id {
  font-family: monospace;
  font-weight: 600;
  color: #2d3748;
}

.status span {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-pending {
  background-color: #fefcbf;
  color: #975a16;
}

.status-paid {
  background-color: #c6f6d5;
  color: #276749;
}

.status-shipped {
  background-color: #bee3f8;
  color: #2b6cb0;
}

.status-delivered {
  background-color: #c6f6d5;
  color: #276749;
}

.status-cancelled {
  background-color: #fed7d7;
  color: #c53030;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.view-btn:hover {
  background-color: #3182ce;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.page-info {
  color: #718096;
  font-size: 0.95rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #edf2f7;
  color: #2d3748;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Order Details Modal */
.order-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.close-modal-btn {
  background: transparent;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #a0aec0;
  transition: color 0.2s ease;
}

.close-modal-btn:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.order-number h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: #2d3748;
}

.order-date {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.customer-info, .shipping-info, .payment-info {
  padding: 1.25rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.customer-info h4, .shipping-info h4, .payment-info h4, .order-items h4 {
  margin: 0 0 1rem;
  color: #4a5568;
  font-size: 1.1rem;
  font-weight: 600;
}

.name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.email, .phone {
  color: #718096;
  margin: 0 0 0.25rem;
}

.payment-method, .card-info, .payment-status {
  margin: 0 0 0.75rem;
  display: flex;
  justify-content: space-between;
}

.label {
  color: #718096;
  font-size: 0.95rem;
}

.order-items {
  margin-bottom: 2.5rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.items-table th, .items-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.items-table th {
  font-weight: 600;
  color: #4a5568;
  background-color: #f7fafc;
  text-align: left;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-image {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #e2e8f0;
}

.product-name {
  font-weight: 500;
  color: #2d3748;
}

.subtotal-label, .shipping-label, .total-label {
  text-align: right;
  font-weight: 500;
  color: #4a5568;
}

.total-label, .total-value {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
}

.order-actions {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-update {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.update-status-btn {
  padding: 0.5rem 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.update-status-btn:hover:not(:disabled) {
  background-color: #3182ce;
}

.update-status-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.print-btn {
  padding: 0.5rem 1rem;
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.print-btn:hover {
  background-color: #edf2f7;
  color: #2d3748;
}

.print-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group, .search-group {
    width: 100%;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  .status-update {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .status-update label {
    margin-bottom: 0.5rem;
  }
  
  .status-update select {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .update-status-btn {
    width: 100%;
  }
  
  .print-btn {
    width: 100%;
    justify-content: center;
  }
}

@media print {
  .admin-orders {
    padding: 0;
    max-width: none;
  }
  
  .page-header, .filters, .orders-table, .pagination, .modal-overlay, .close-modal-btn, .order-actions {
    display: none;
  }
  
  .modal-content {
    box-shadow: none;
    max-height: none;
    width: 100%;
    max-width: 100%;
    border-radius: 0;
    overflow: visible;
  }
  
  .modal-header {
    border-bottom: 2px solid #000;
  }
  
  .modal-body {
    page-break-inside: avoid;
  }
  
  .details-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  /* Avoid page breaks inside important sections */
  .order-header, .details-grid, .order-items {
    page-break-inside: avoid;
  }
}
</style>
