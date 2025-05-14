import React from 'react';
import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page">
      <div className="container">
        <div className="about-content">
          <h1>About Sweet Moment</h1>
          <div className="about-section">
            <div className="about-image">
              <img src="images/about-image.jpg" alt="Sweet Moment Story" />
            </div>
            <div className="about-text">
              <h2>Our Story</h2>
              <p>Sweet Moment was founded with a simple mission: to create exceptional chocolates that transform ordinary moments into unforgettable experiences.</p>
              <p>Our master chocolatiers combine time-honored traditions with innovative techniques to craft chocolates that delight the senses and elevate any occasion.</p>
              <p>From our small beginnings to becoming a beloved brand, we've remained committed to quality, sustainability, and the joy of sharing life's sweet moments.</p>
            </div>
          </div>
          
          <div className="about-values">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <h3>Quality</h3>
                <p>We use only the finest ingredients, sourced from responsible producers around the world.</p>
              </div>
              <div className="value-item">
                <h3>Craftsmanship</h3>
                <p>Each chocolate is handcrafted with meticulous attention to detail and artistic presentation.</p>
              </div>
              <div className="value-item">
                <h3>Innovation</h3>
                <p>We continually explore new flavors, techniques, and designs to surprise and delight our customers.</p>
              </div>
              <div className="value-item">
                <h3>Community</h3>
                <p>We believe in giving back to the communities that support us and those that grow our ingredients.</p>
              </div>
            </div>
          </div>
          
          <div className="static-site-notice">
            <p>This is a preview version of our site. To see our full story and selection, please visit our <a href="https://sweetmomentchocolate.com" target="_blank" rel="noopener noreferrer">main website</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;