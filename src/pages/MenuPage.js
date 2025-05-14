import React from 'react';
import { Link } from 'react-router-dom';
import './MenuPage.css';

function MenuPage() {
  const products = [
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
  const categories = [
  {
    "id": 1,
    "name": "Signature Collection",
    "slug": "signature-collection",
    "description": "Our signature selection of handcrafted chocolates",
    "image": "uploads/signature-collection.jpg",
    "badge": "best-seller"
  },
  {
    "id": 2,
    "name": "Premium Collection",
    "slug": "premium-collection",
    "description": "Luxury chocolate experiences with premium ingredients",
    "image": "uploads/premium-collection.jpg",
    "badge": "premium"
  },
  {
    "id": 3,
    "name": "Seasonal Collection",
    "slug": "seasonal-collection",
    "description": "Limited edition chocolates for special occasions",
    "image": "uploads/seasonal-collection.jpg",
    "badge": "new"
  }
];
  
  // Group products by category
  const productsByCategory = categories.map(category => ({
    ...category,
    products: products.filter(product => product.category === category.id || product.category === category.name)
  }));
  
  return (
    <div className="menu-page">
      <div className="container">
        <h1>Our Chocolate Menu</h1>
        
        <div className="category-navigation">
          {categories.map(category => (
            <a key={category.id} href={`#category-${category.id}`} className="category-link">
              {category.name}
            </a>
          ))}
        </div>
        
        {productsByCategory.map(category => (
          <div key={category.id} id={`category-${category.id}`} className="category-section">
            <h2>{category.name}</h2>
            {category.description && <p className="category-description">{category.description}</p>}
            
            <div className="products-grid">
              {category.products.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="product-card">
                  <div className="product-image">
                    <img src={product.image.startsWith('/') ? product.image.substring(1) : product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price">{'$'}{product.basePrice.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        <div className="static-site-notice">
          <p>This is a preview version of our site. To purchase our products, please visit our <a href="https://sweetmomentchocolate.com" target="_blank" rel="noopener noreferrer">main website</a>.</p>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;