/**
 * Simplified Client Folder Processor
 * 
 * This script takes the entire client folder, copies it, and removes the features
 * that should be excluded from the static site:
 * - Admin panel
 * - Checkout
 * - Cart
 * - Orders
 * - Account
 * - Login
 * - Custom orders
 * 
 * It preserves the exact structure and functionality of all other components.
 */

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// Configuration
const config = {
  // Source client folder
  clientSrcDir: path.resolve(__dirname, '../client/src'),
  // Temporary output directory
  tempOutputDir: path.resolve(__dirname, '../temp-static-output'),
  // Features to exclude
  excludeFeatures: [
    'admin',
    'checkout',
    'cart',
    'orders',
    'account',
    'login',
    'custom-orders',
    'social-media'
  ],
  // Paths to exclude (relative to client/src)
  excludePaths: [
    'components/admin',
    'pages/admin',
    'components/checkout',
    'pages/checkout',
    'components/cart',
    'pages/cart',
    'components/orders',
    'pages/orders',
    'components/account',
    'pages/account',
    'components/auth',
    'pages/auth',
    'pages/login',
    'pages/register',
    'components/custom-order',
    'pages/custom-order'
  ],
  // Replace API calls with static data
  replaceApiCalls: true
};

/**
 * Copy a file from source to destination
 */
function copyFile(source, destination) {
  try {
    const content = fs.readFileSync(source, 'utf8');
    
    // Ensure destination directory exists
    const destDir = path.dirname(destination);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Process file content (e.g., remove excluded features)
    const processedContent = processFileContent(content, source);
    
    fs.writeFileSync(destination, processedContent);
    return true;
  } catch (error) {
    console.error(`Error copying file ${source}:`, error);
    return false;
  }
}

/**
 * Process file content to remove excluded features
 */
function processFileContent(content, filePath) {
  // Skip binary files or non-code files
  if (!filePath.match(/\.(js|jsx|ts|tsx|css|html)$/)) {
    return content;
  }
  
  let processed = content;
  
  // Replace API calls with static data for TS/JS files
  if (config.replaceApiCalls && filePath.match(/\.(js|jsx|ts|tsx)$/)) {
    processed = replaceApiCalls(processed);
  }
  
  // Remove imports from excluded features
  config.excludeFeatures.forEach(feature => {
    // Match import statements that include the excluded feature
    const importRegex = new RegExp(`import\\s+(?:.+?)\\s+from\\s+['"](.+?${feature}.+?)['"]`, 'g');
    processed = processed.replace(importRegex, '// Excluded for static site: $&');
    
    // Also remove route definitions for excluded features
    if (filePath.includes('App.tsx') || filePath.includes('routes')) {
      const routeRegex = new RegExp(`<Route\\s+(?:.*?)path=['"]/?${feature}.*?['\"](?:.*?)>(?:[\\s\\S]*?)<\\/Route>`, 'g');
      processed = processed.replace(routeRegex, '{\/* Excluded for static site: Route to ${feature} *\/}');
    }
  });
  
  // Remove nav links to excluded features
  if (filePath.includes('Navigation') || filePath.includes('header') || filePath.includes('nav')) {
    config.excludeFeatures.forEach(feature => {
      // Match list items or links that include the excluded feature
      const navLinkRegex = new RegExp(`<(?:li|a|Link)\\s+(?:.*?)(?:href|to)=['"]/?${feature}.*?['"](?:.*?)>(?:[\\s\\S]*?)<\\/(?:li|a|Link)>`, 'g');
      processed = processed.replace(navLinkRegex, '{\/* Excluded for static site: Link to ${feature} *\/}');
    });
  }
  
  return processed;
}

/**
 * Replace API calls with static data access
 */
function replaceApiCalls(content) {
  let processed = content;
  
  // Replace fetch API calls
  const fetchRegex = /fetch\((['"`])\/api\/([^'"`]+)(['"`])[^)]*\)/g;
  processed = processed.replace(fetchRegex, 'fetch($1/static-data/$2.json$3)');
  
  // Replace axios API calls
  const axiosRegex = /axios\.(?:get|post|put|delete)\((['"`])\/api\/([^'"`]+)(['"`])/g;
  processed = processed.replace(axiosRegex, 'axios.get($1/static-data/$2.json$3');
  
  // Replace useQuery hooks
  const useQueryRegex = /useQuery\(\s*\{\s*queryKey:\s*\[\s*(['"`])\/api\/([^'"`]+)(['"`])/g;
  processed = processed.replace(useQueryRegex, 'useQuery({ queryKey: [$1/static-data/$2.json$3');
  
  return processed;
}

/**
 * Main function to process client source directory
 */
async function processClientDirectory() {
  const zip = new JSZip();
  
  // Clear output directory if it exists
  if (fs.existsSync(config.tempOutputDir)) {
    fs.rmSync(config.tempOutputDir, { recursive: true, force: true });
  }
  
  // Create output directory
  fs.mkdirSync(config.tempOutputDir, { recursive: true });
  
  // Copy and process files
  processDirectory(config.clientSrcDir, config.tempOutputDir, zip);
  
  // Add necessary static files
  addStaticFiles(zip);
  
  // Generate zip file
  const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
  const zipPath = path.resolve(__dirname, '../static-site-simplified.zip');
  fs.writeFileSync(zipPath, zipContent);
  
  console.log(`Successfully created simplified static site at ${zipPath}`);
  return zipPath;
}

/**
 * Process a directory recursively
 */
function processDirectory(sourceDir, targetDir, zip, relativePath = '') {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    const relPath = relativePath ? path.join(relativePath, file) : file;
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (config.excludePaths.some(exclude => relPath.startsWith(exclude))) {
        console.log(`Skipping excluded directory: ${relPath}`);
        return;
      }
      
      // Create target directory
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      
      // Process subdirectory
      processDirectory(sourcePath, targetPath, zip.folder(file), relPath);
    } else {
      // Skip excluded files
      if (config.excludePaths.some(exclude => relPath.startsWith(exclude))) {
        console.log(`Skipping excluded file: ${relPath}`);
        return;
      }
      
      // Copy and process file
      if (copyFile(sourcePath, targetPath)) {
        // Add to zip
        zip.file(relPath, fs.readFileSync(targetPath));
      }
    }
  });
}

/**
 * Add necessary static files
 */
function addStaticFiles(zip) {
  // Create static-data directory for the JSON files
  const staticDataDir = zip.folder('static-data');
  
  // Add products.json
  const productsJson = JSON.stringify([
    {
      id: 'ClassicChocolate',
      name: 'Classic Chocolate',
      description: 'Our timeless collection of handcrafted chocolates, made with the finest cocoa beans.',
      basePrice: 800,
      image: '/uploads/1742792807445-327362076.jpeg',
      category: 'chocolates',
      featured: true,
      sizeOptions: JSON.stringify([
        { id: 'small', label: 'Small Box', price: 0, quantity: 5 },
        { id: 'medium', label: 'Medium Box', price: 700, quantity: 10 },
        { id: 'large', label: 'Large Box', price: 1900, quantity: 25 }
      ]),
      typeOptions: JSON.stringify([
        { id: 'milk', label: 'Milk Chocolate', value: 'milk', price: 0 },
        { id: 'dark', label: 'Dark Chocolate', value: 'dark', price: 200 }
      ])
    },
    {
      id: 'CaramelChocolate',
      name: 'Caramel Chocolate',
      description: 'Smooth caramel wrapped in rich chocolate, crafted to perfection for a luxurious treat.',
      basePrice: 800,
      image: '/uploads/1743291047091-28168151.jpeg',
      category: 'chocolates',
      featured: true,
      sizeOptions: JSON.stringify([
        { id: 'small', label: 'Small Box', price: 0, quantity: 5 },
        { id: 'medium', label: 'Medium Box', price: 700, quantity: 10 },
        { id: 'large', label: 'Large Box', price: 1900, quantity: 25 }
      ]),
      typeOptions: JSON.stringify([
        { id: 'milk', label: 'Milk Chocolate', value: 'milk', price: 0 },
        { id: 'dark', label: 'Dark Chocolate', value: 'dark', price: 200 }
      ])
    },
    {
      id: 'DubaiBar',
      name: 'Dubai Bar',
      description: 'A larger take on our most-loved classic, handcrafted with the same signature richness and smooth texture.',
      basePrice: 500,
      image: '/uploads/1743291189443-982604173.jpeg',
      category: 'bars',
      shapeOptions: JSON.stringify([
        { id: 'rectangular', label: 'Rectangular', price: 0 }
      ]),
      typeOptions: JSON.stringify([
        { id: 'milk', label: 'Milk', price: 0 },
        { id: 'dark', label: 'Dark', price: 200 }
      ])
    },
    {
      id: 'SignatureCollection',
      name: 'Signature Collection',
      description: 'A curated box of handcrafted favorites including Classic Milk, Dark, Caramel and Chocolate Covered Nuts. Perfect for those who crave variety in every bite.',
      basePrice: 1000,
      image: '/uploads/1743291231491-348258896.jpeg',
      category: 'collections',
      featured: true,
      sizeOptions: JSON.stringify([
        { id: 'small', label: 'Small', price: 0, quantity: 5 },
        { id: 'large', label: 'Large', price: 2000, quantity: 25 }
      ])
    },
    {
      id: 'AssortedNutsChocolate',
      name: 'Assorted Nuts Chocolate',
      description: 'A delightful mix of premium chocolates with assorted nuts from around the world.',
      basePrice: 900,
      image: '/uploads/1743291290583-389726651.jpeg',
      category: 'chocolates',
      sizeOptions: JSON.stringify([
        { id: 'standard', label: 'Standard Bag', price: 0, quantity: 0 }
      ]),
      typeOptions: JSON.stringify([
        { id: 'milk', label: 'Milk Chocolate', value: 'milk', price: 0 },
        { id: 'dark', label: 'Dark Chocolate', value: 'dark', price: 200 }
      ])
    }
  ]);
  staticDataDir.file('products.json', productsJson);
  
  // Add categories.json
  const categoriesJson = JSON.stringify([
    { id: 1, name: 'Chocolates', slug: 'chocolates', description: 'Our premium chocolate selection' },
    { id: 2, name: 'Bars', slug: 'bars', description: 'Artisan chocolate bars' },
    { id: 3, name: 'Collections', slug: 'collections', description: 'Curated chocolate collections' }
  ]);
  staticDataDir.file('categories.json', categoriesJson);
  
  // Add site-customization.json for site configuration
  const siteCustomizationJson = JSON.stringify({
    heroSection: JSON.stringify({
      title: "Experience Life's Sweetest Moments",
      subtitle: "Curated treats and heartfelt gifts that brighten every day",
      buttonText: "Discover Your Moment",
      buttonLink: "/menu",
      imageUrl: "/uploads/1742773966114-127560992.jpeg",
      images: [
        "/uploads/1742773966114-127560992.jpeg",
        "/uploads/1743207809787-339256261.jpeg"
      ],
      autoplayInterval: 5000
    }),
    featuredProductsSection: JSON.stringify({
      enabled: true,
      title: "Our Featured Products",
      subtitle: "Handcrafted with premium ingredients and lots of love",
      maxProducts: 3
    }),
    signatureSection: JSON.stringify({
      enabled: true,
      title: "Chocolate For Any Occasion",
      subtitle: "Experience our finest handcrafted selection, created by our master chocolatier using premium ingredients sourced from around the world. A perfect gift for those special moments.",
      buttonText: "Custom Order",
      buttonLink: "/custom-order",
      imageUrl: "/uploads/1744075563796-815996067.jpeg"
    })
  });
  staticDataDir.file('site-customization.json', siteCustomizationJson);
  
  // Add index.html
  zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sweet Moment Chocolates</title>
  <link rel="stylesheet" href="/index.css">
</head>
<body>
  <div id="root"></div>
  <script>
    // Static site configuration
    window.STATIC_MODE = true;
    window.STATIC_DATA_PATH = '/static-data';
  </script>
  <script src="/index.js"></script>
</body>
</html>`);
}

// Export the function for use by the React component
module.exports = { processClientDirectory };

// Run the function if called directly
if (require.main === module) {
  processClientDirectory();
}