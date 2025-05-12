import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductPage.css';

function ProductPage() {
  const { id } = useParams();
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
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return <div>Product not found</div>;
  }
  
  // Options display helper function
  const showOptions = (optionsString, label) => {
    if (!optionsString) return null;
    try {
      const options = JSON.parse(optionsString);
      if (!options || options.length === 0) return null;
      
      return (
        <div className="product-options">
          <h3>{label}</h3>
          <div className="options-list">
            {options.map((option, index) => (
              <div key={index} className="option-item">{option.name}</div>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-details">
          <div className="product-image">
            <img src={product.image.startsWith('/') ? product.image.substring(1) : product.image} alt={product.name} />
          </div>
          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="price">{'$'}{product.basePrice.toFixed(2)}</p>
            <p className="description">{product.description}</p>
            
            {showOptions(product.sizeOptions, 'Available Sizes')}
            {showOptions(product.typeOptions, 'Chocolate Types')}
            {showOptions(product.shapeOptions, 'Available Shapes')}
            
            {product.allergyInfo && (
              <div className="allergy-info">
                <h3>Allergy Information</h3>
                <p>{product.allergyInfo}</p>
              </div>
            )}
            
            <div className="static-site-notice">
              <p>This is a preview version of our site. To purchase this product, please visit our <a href="https://sweetmomentchocolate.com" target="_blank" rel="noopener noreferrer">main website</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;