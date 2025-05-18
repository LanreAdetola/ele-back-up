<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>{{ $t('admin.dashboard.title') }}</h1>
      <button @click="handleLogout" class="logout-btn">
        {{ $t('admin.dashboard.logout') }}
      </button>
    </header>

    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ $t('admin.dashboard.totalProducts') }}</h3>
          <p class="stat-value">{{ stats.totalProducts }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('admin.dashboard.totalOrders') }}</h3>
          <p class="stat-value">{{ stats.totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('admin.dashboard.totalUsers') }}</h3>
          <p class="stat-value">{{ stats.totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>{{ $t('admin.dashboard.revenue') }}</h3>
          <p class="stat-value">XAF {{ stats.revenue.toLocaleString() }}</p>
        </div>
      </div>

      <div class="actions-grid">
        <router-link to="/admin/products" class="action-card">
          <h3>{{ $t('admin.dashboard.manageProducts') }}</h3>
          <p>{{ $t('admin.dashboard.manageProductsDesc') }}</p>
        </router-link>
        <router-link to="/admin/orders" class="action-card">
          <h3>{{ $t('admin.dashboard.manageOrders') }}</h3>
          <p>{{ $t('admin.dashboard.manageOrdersDesc') }}</p>
        </router-link>
        <router-link to="/admin/users" class="action-card">
          <h3>{{ $t('admin.dashboard.manageUsers') }}</h3>
          <p>{{ $t('admin.dashboard.manageUsersDesc') }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  revenue: 0
})

const fetchStats = async () => {
  try {
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount');

    const { count: usersCount } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true });

    stats.value = {
      totalProducts: productsCount || 0,
      totalOrders: ordersData?.length || 0,
      totalUsers: usersCount || 0,
      revenue: ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();
    
  return !error && data !== null;
};

const handleSubmit = async () => {
  try {
    if (!await isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Your existing submit logic here
    
  } catch (error) {
    console.error('Operation failed:', error);
    errorMessage.value = error.message;
  }
};

onMounted(() => {
  fetchStats()
})
</script>


<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #333;
  font-size: 2rem;
  font-weight: 300;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c82333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: #333;
  font-size: 2rem;
  font-weight: 500;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-card h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.action-card p {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>