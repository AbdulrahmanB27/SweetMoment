import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const featuredProducts = [
  {
    "id": "ClassicChocolate",
    "name": "Classic Chocolate",
    "description": "Our signature chocolate, handcrafted with premium cocoa.",
    "image": "uploads/classic-chocolate.jpg",
    "rating": 5,
    "reviewCount": 42,
    "basePrice": 15,
    "category": "Signature Collection",
    "featured": true,
    "inventory": 100,
    "sizeOptions": "[\"small\",\"medium\",\"large\"]",
    "typeOptions": "[\"milk\",\"dark\",\"white\"]",
    "shapeOptions": null,
    "mixedTypeEnabled": false,
    "enableMixedSlider": false,
    "mixedTypeFee": 0,
    "allergyInfo": "Contains milk and soy. May contain traces of nuts.",
    "ingredients": "Cocoa, sugar, milk powder, cocoa butter, vanilla",
    "displayOrder": 1,
    "visible": true,
    "badge": "best-seller"
  },
  {
    "id": "CaramelChocolate",
    "name": "Caramel Chocolate",
    "description": "Rich chocolate with a luxurious caramel filling.",
    "image": "uploads/caramel-chocolate.jpg",
    "rating": 4.8,
    "reviewCount": 36,
    "basePrice": 17,
    "category": "Signature Collection",
    "featured": true,
    "inventory": 85,
    "sizeOptions": "[\"small\",\"medium\",\"large\"]",
    "typeOptions": "[\"milk\",\"dark\"]",
    "shapeOptions": null,
    "mixedTypeEnabled": false,
    "enableMixedSlider": false,
    "mixedTypeFee": 0,
    "allergyInfo": "Contains milk and soy. May contain traces of nuts.",
    "ingredients": "Cocoa, sugar, caramel, milk powder, cocoa butter, vanilla",
    "displayOrder": 2,
    "visible": true,
    "badge": "popular"
  },
  {
    "id": "DubaiBar",
    "name": "Dubai Bar",
    "description": "A taste of luxury with premium Dubai ingredients.",
    "image": "uploads/dubai-bar.jpg",
    "rating": 5,
    "reviewCount": 28,
    "basePrice": 25,
    "category": "Premium Collection",
    "featured": true,
    "inventory": 50,
    "sizeOptions": null,
    "typeOptions": "[\"milk\",\"dark\"]",
    "shapeOptions": "[\"rectangular\"]",
    "mixedTypeEnabled": false,
    "enableMixedSlider": false,
    "mixedTypeFee": 0,
    "allergyInfo": "Contains milk and soy. May contain traces of nuts.",
    "ingredients": "Premium cocoa, sugar, milk powder, cocoa butter, saffron, dates, gold leaf",
    "displayOrder": 3,
    "visible": true,
    "badge": "premium"
  }
];
  
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Experience Life's Sweetest Moments</h1>
          <p>Curated treats and heartfelt gifts that brighten every day</p>
          <Link to="/menu" className="button">Discover Your Moment</Link>
        </div>
      </div>
      
      <div className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`}>
                  <img src={'./'+product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p className="price">{'$'}{product.basePrice.toFixed(2)}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;