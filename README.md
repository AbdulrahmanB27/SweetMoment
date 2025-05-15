# Sweet Moment Static Site

This is a static HTML version of the Sweet Moment website that looks and functions exactly like the main site. Perfect for hosting on GitHub Pages or any static site hosting service.

## Structure
- `index.html` - Home page
- `menu.html` - Menu page with all products
- `about.html` - About page
- `products/` - Directory containing individual product pages
- `checkout/` - Checkout page that directs to the main site for payment processing
- `checkout/success.html` - Order confirmation page
- `public/` - Static assets like images, CSS, and JavaScript

## Functionality
- The static site looks identical to the main site
- "Add to Cart" buttons and checkout links direct users to the main site seamlessly
- All product information, pricing, and descriptions match the main site
- Checkout flow maintains the same look and feel as the main site

## Hosting Instructions

### GitHub Pages
1. Create a new repository on GitHub
2. Upload all these files to the repository
3. Go to repository Settings > Pages
4. Select the branch where your files are stored
5. Click Save
6. Your site will be published at `https://username.github.io/repository`

### Other Hosting Services
Upload all files to the root directory of your web server.

## Updating Content
To update content, regenerate the static site from the admin panel of the main site whenever your product catalog or site content changes.

## Technical Details
- No "preview" or "static version" banners - presents as a fully functional site
- Maintains all visual elements and styling of the main site
- Checkout redirects to the main site's payment processing for actual transactions
- All product pages maintain their original appearance
