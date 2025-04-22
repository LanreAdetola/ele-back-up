<template>
  <div class="about-page">
    <div class="container">
      <h1>About Us</h1>
      
      <div class="about-content">
        <div class="image-section">
          <div class="image-container">
            <img src="/src/assets/elegant-background.png" alt="Elegant jewelry">
          </div>
        </div>
        
        <div class="text-section">
          <p>At The Elegant Gem, we believe jewelry is more than just an accessory—it's a reflection of your style, confidence, and story. Our pieces are thoughtfully curated to bring elegance, meaning, and a touch of timeless beauty to your everyday moments.</p>
          
          <p>Whether you're looking for the perfect gift or a statement piece for yourself, our collection is here to celebrate life's special occasions and everyday elegance.</p>
          
          <p>We take pride in sourcing premium pieces and offering exquisite designs that blend sophistication with affordability. Every piece is carefully selected to ensure it complements your personality and enhances your natural glow.</p>
        </div>
      </div>

      <div class="about-content1">
        <div class="image-section">
          <div class="image-container">
            <img src="/src/assets/elegant-enyah.jpg" alt="Enyah">
          </div>
        </div>
        
        <div class="text-section">
          <h2>Meet Enyah</h2>
          <p>I love jewelries.  These accessories elevate your looks anytime, any day in ways one can't explain. You walk into a room, spot beautiful ladies but there is one thing that has you fascinated, guess what that is?</p>
          <p>I was drawn to the elegance of fine accessories and the way they could tell a story without words. This passion led me to create The Elegant Gem a brand that embodies sophistication, uniqueness, and personal expression.  I believe jewelries should not only be an ornament but an extension of who you are.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding: 3rem 0;
  min-height: 100vh;
  background-color: #d2d6de; /* Match footer color */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

h1 {
  text-align: center;
  margin-bottom: 3rem;
  color: #0f0f10;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 1rem;
  font-family: 'Playfair Display', serif;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, #63b3ed, #4299e1);
  border-radius: 3px;
}

.about-content, .about-content1, .about-content2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background-color: #c6cbd5; /* dark card background */
  color: #e2e8f0;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  margin-bottom: 3rem;
}

.about-content2 {
  grid-template-columns: 1fr 1fr;
}

.image-container {
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  height: 100%;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.5s ease;
  filter: brightness(0.95);
}

.image-container:hover img {
  transform: scale(1.03);
  filter: brightness(1);
}

.text-section p {
  color: #090909;
  line-height: 1.9;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  font-weight: 400;
  font-family: 'Georgia', 'Times New Roman', serif;
  letter-spacing: 0.25px;
  transition: all 0.3s ease-in-out;
}

.text-section h2 {
  color: #090909;
  font-size: 1.9rem;
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  margin-bottom: 1.2rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.text-section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, #63b3ed, #4299e1);
  border-radius: 2px;
}

.text-section p:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .about-page {
    padding: 2rem 0;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .about-content, .about-content1, .about-content2 {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .image-container {
    max-height: 350px;
  }
}

@media (max-width: 480px) {
  .about-content, .about-content1, .about-content2 {
    padding: 1.25rem;
  }

  .text-section p {
    font-size: 1rem;
  }

  .text-section h2 {
    font-size: 1.5rem;
  }
}
</style>
