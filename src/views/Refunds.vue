<template>
  <div class="refunds-page">
    <div class="container">
      <h1>Refunds & Delivery</h1>
      
      <div class="policy-content">
        <div class="policy-section">
          <h2>Refund Policy</h2>
          <p class="intro">The Elegant Gem prides herself in ensuring customer satisfaction, please kindly read the terms below.</p>
          
          <ul class="policy-list">
            <li>Requests should be made within 2 business days of purchase.</li>
            <li>To be eligible for refund, item should be unused, in its original condition and original packaging.</li>
            <li>After return we shall notify you of the approval or rejection of your refund.</li>
          </ul>
        </div>
        
        <div class="policy-section">
          <h2>Delivery Information</h2>
          
          <ul class="policy-list">
            <li>Orders are processed within 2 business days (excluding holidays and weekends).</li>
            <li>Delivery fee depends on your location.</li>
            <li>Delivery times may vary due to unforeseen circumstances.</li>
          </ul>
          
          <div class="contact-info">
            <p>For any questions regarding refunds or delivery, please contact our customer service team.</p>
            <a href="mailto:support@elegantgem.com" class="contact-button">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.refunds-page {
  padding: 3rem 0;
  min-height: 100vh;
  background-color: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

h1 {
  text-align: center;
  margin-bottom: 3rem;
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, #3182ce, #4299e1);
  border-radius: 3px;
}

.policy-content {
  background: white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.policy-section {
  margin-bottom: 2.5rem;
}

.policy-section:last-child {
  margin-bottom: 0;
}

h2 {
  color: #3182ce;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.intro {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.policy-list {
  list-style-type: none;
  padding: 0;
}

.policy-list li {
  position: relative;
  padding-left: 1.75rem;
  margin-bottom: 1rem;
  font-size: 1.05rem;
  line-height: 1.6;
  color: #4a5568;
}

.policy-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 0.5rem;
  height: 0.5rem;
  background: linear-gradient(to right, #3182ce, #4299e1);
  border-radius: 50%;
}

.contact-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #ebf8ff;
  border-radius: 0.5rem;
  border-left: 4px solid #3182ce;
}

.contact-info p {
  margin-bottom: 1rem;
  font-size: 1.05rem;
  color: #2d3748;
}

.contact-button {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(to right, #3182ce, #4299e1);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
}

.contact-button:hover {
  background: linear-gradient(to right, #2c5282, #3182ce);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);
}

@media (max-width: 768px) {
  .refunds-page {
    padding: 2rem 0;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .policy-content {
    padding: 1.5rem;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  .policy-list li, .intro, .contact-info p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .policy-content {
    padding: 1.25rem;
  }
  
  .contact-info {
    padding: 1rem;
  }
}
</style> 