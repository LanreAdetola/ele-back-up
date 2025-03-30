<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.image" :alt="product.name">
      <div class="product-overlay">
        <button class="btn">Add to Cart</button>
      </div>
    </div>
    <div class="product-info">
      <h3>{{ product.name }}</h3>
      <p class="price">XAF {{ product.price.toFixed(2) }}</p>
      <p class="description">{{ product.description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-info h3 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.price {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .product-card {
    margin: 0 0.5rem;
  }

  .product-info {
    padding: 0.75rem;
  }

  .product-info h3 {
    font-size: 1.1rem;
  }

  .price {
    font-size: 1rem;
  }

  .description {
    font-size: 0.85rem;
  }

  .product-overlay {
    opacity: 1;
    background: rgba(0, 0, 0, 0.2);
  }

  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style> 