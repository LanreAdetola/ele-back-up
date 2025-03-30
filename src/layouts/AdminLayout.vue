<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="logo">Elegant Gem Admin</router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" exact-active-class="active">Dashboard</router-link>
        <router-link to="/admin/products" exact-active-class="active">Products</router-link>
        <router-link to="/admin/orders" exact-active-class="active">Orders</router-link>
        <router-link to="/admin/users" exact-active-class="active">Users</router-link>
        <router-link to="/collection" exact-active-class="active">Back to Store</router-link>
      </nav>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.admin-sidebar {
  width: 240px;
  background-color: #2c5282;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
}

.sidebar-header {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.logo {
  color: white;
  text-decoration: none;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.sidebar-nav a:hover {
  opacity: 0.8;
}

.sidebar-nav .active {
  text-decoration: underline;
}

.admin-main {
  flex-grow: 1;
  padding: 2rem;
  background: #f9f9f9;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;
  }

  .sidebar-nav {
    flex-direction: row;
    gap: 1rem;
  }

  .admin-main {
    padding: 1rem;
  }
}
</style>
