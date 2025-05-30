import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import Collection from '../views/Collection.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AuthCallback from '../views/AuthCallback.vue'
import ProductDetail from '../views/ProductDetail.vue'
import AboutUs from '../views/AboutUs.vue'
import Refunds from '../views/Refunds.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/collection'
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue')
    },
    {
      path: '/collection',
      name: 'collection',
      component: Collection,
      meta: { requiresAuth: false }
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetail,
      meta: { requiresAuth: false }
    },
    {
      path: '/about-us',
      name: 'about-us',
      component: AboutUs,
      meta: { requiresAuth: false }
    },
    {
      path: '/refunds',
      name: 'refunds',
      component: Refunds,
      meta: { requiresAuth: false }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/Checkout.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/payment',
      name: 'payment',
      component: () => import('../views/Payment.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/order-confirmation/:id',
      name: 'order-confirmation',
      component: () => import('../views/OrderConfirmation.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallback
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/Account.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('../views/admin/AdminProducts.vue')
        },
        {
          path: 'products/:id/edit', // ✅ Place it here inside children
          name: 'admin-product-edit',
          component: () => import('../views/admin/AdminProductEdit.vue')
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/Orders.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/Users.vue')
        },
        {
          path: 'upload-test',
          name: 'admin-upload-test',
          component: () => import('../views/admin/UploadTest.vue')
        }
      ]
    }
    
  ]
})

router.beforeEach(async (to, from, next) => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error fetching session:', sessionError);
    alert('An error occurred. Please try again.');
    return next('/login');
  }

  const isLoggedIn = !!session?.user;
  const requiresAuth = to.meta.requiresAuth;
  const requiresAdmin = to.meta.requiresAdmin;

  if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    return next('/collection');
  } else if (requiresAuth && !isLoggedIn) {
    return next('/login');
  } else if (requiresAdmin) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        return next('/login');
      }

      console.log('Checking admin status for user:', user.id);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Admin check result:', { data, error, userId: user.id });

      if (error) {
        console.error('Error checking admin status:', error);
        return next('/');
      }

      if (!data) {
        console.log('User is not an admin');
        alert('Access denied. Admins only.');
        return next('/');
      }

      console.log('Admin access granted');
      return next();
    } catch (err) {
      console.error('Unexpected error during admin check:', err);
      return next('/');
    }
  } else {
    return next();
  }
});

export default router
