# Sweet Moment Chocolates - Static Site

This is the static version of the Sweet Moment Chocolates website, designed for deployment on platforms like GitHub Pages.

## Features

- Static HTML pages for key sections (home, menu, products, about)
- Stripe checkout integration via redirect to the main site
- Simplified product browsing experience
- Direct checkout buttons on product and menu pages

## Directory Structure

```
static-site/
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── pages/
│   ├── products/
│   ├── about.html
│   └── menu.html
├── api-cache/
└── index.html
```

## How to Update Products

### Adding a New Product

1. On your main site, add the product through the admin interface
2. Regenerate the static site using the generator script:

```
node scripts/generate-static-site.js
```

### Manually Adding a Product

If you want to manually add a product to the static site:

1. Create a new HTML file in `pages/products/` with the product name as the slug (e.g., `dark-truffle.html`)
2. Use the existing product pages as a template
3. Update the product details, including:
   - Name
   - Description
   - Price
   - Image URL
   - Options (size, type, shape)
4. Add the product to the menu page by editing `pages/menu.html`

### Product Options

The static site supports the same product options as the main site:

- **Size Options**: Different box sizes (Small, Medium, Large)
- **Type Options**: Chocolate types (Milk, Dark)
- **Shape Options**: Special shapes when available

For each option:
- If the option value is "none", it won't be displayed
- Price adjustments for options are displayed automatically
- Quantity information is shown for size options

## Deployment to GitHub Pages

1. Push the entire `static-site` directory to your GitHub repository
2. Enable GitHub Pages in your repository settings
3. Set the source to the branch and directory containing the static site

## Customization

- Edit CSS files in `assets/css/` to customize the appearance
- Update the main site URL in the JavaScript files if your domain changes
- Replace placeholder images with actual product and branding images

## Maintaining Consistency

Remember to regenerate the static site whenever you make significant changes to products or content on the main site to keep both versions in sync.
