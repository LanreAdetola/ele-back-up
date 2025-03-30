<template>
  <div class="test-view">
    <h1>Test Page</h1>
    <p>This is a simple test page to verify that Vue is working correctly.</p>
    <div class="counter">
      <p>Count: {{ count }}</p>
      <button @click="increment">Increment</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<style scoped>
.test-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.counter {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

button {
  padding: 0.5rem 1rem;
  background-color: #2c5282;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

button:hover {
  background-color: #2a4365;
}
</style> 