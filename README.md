# Sweet Moment Static Site

This is a static HTML version of the Sweet Moment website, perfect for hosting on GitHub Pages or any static site hosting service.

## Structure
- `index.html` - Home page
- `menu.html` - Menu page with all products
- `about.html` - About page
- `products/` - Directory containing individual product pages
- `checkout/` - Redirects to the main site for checkout
- `public/` - Static assets like images, CSS, and JavaScript

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
To update content, regenerate the static site from the admin panel of the main site.

## Notes
- This static site links back to the main site for cart and checkout functionality
- Product pages link to the main site for adding items to cart
