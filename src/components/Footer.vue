<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <h2 class="logo-text">The Elegant Gem</h2>
          <p class="tagline">Timeless elegance for every occasion</p>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h3>Shop</h3>
            <ul>
              <li><router-link to="/collection">All Products</router-link></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h3>Customer Care</h3>
            <ul>
              <li><router-link to="/refunds">Refunds & Delivery</router-link></li>
              <li><a href="mailto:support@elegantgem.com">Contact Us</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h3>Company</h3>
            <ul>
              <li><router-link to="/about-us">About Us</router-link></li>
              <li><a href="#">Our Story</a></li>
            </ul>
          </div>
        </div>
        
        <div class="social-connect">
          <h3>Connect With Us</h3>
          <div class="social-icons">
            <a href="#" class="social-icon" aria-label="Instagram">
              <span>📸</span>
            </a>
            <a href="#" class="social-icon" aria-label="Twitter">
              <span>🐦</span>
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} The Elegant Gem. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-logo .logo-text {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  background: linear-gradient(to right, #4299e1, #63b3ed);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-logo .tagline {
  color: #a0aec0;
  font-size: 0.95rem;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.link-group h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: #e2e8f0;
}

.link-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-group ul li {
  margin-bottom: 0.65rem;
}

.link-group ul li a {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.95rem;
}

.link-group ul li a:hover {
  color: #63b3ed;
}

.social-connect h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: #e2e8f0;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4a5568;
  color: #e2e8f0;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-icon:hover {
  background-color: #3182ce;
  transform: translateY(-3px);
}

.social-icon span {
  font-size: 1.2rem;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #4a5568;
  color: #a0aec0;
  font-size: 0.95rem;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 2fr;
  }
  
  .social-connect {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 2.5rem 0 1.5rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .social-connect {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style> 