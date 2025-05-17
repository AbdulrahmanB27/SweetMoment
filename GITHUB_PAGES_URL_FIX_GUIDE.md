# GitHub Pages URL Fix Guide

This guide explains how URL handling works in your Sweet Moment static export on GitHub Pages, and how we fix common URL-related issues.

## Common URL Issues on GitHub Pages

When deploying a React app to GitHub Pages, several URL-related issues can occur:

1. **404 errors on page refresh/direct access** - When users try to visit a specific page directly, GitHub Pages returns a 404 error
2. **Missing resources** - CSS, JavaScript, and image files fail to load due to incorrect paths
3. **Incorrect routing** - Internal links might navigate to non-existent paths

## Our Comprehensive Solution

Your Sweet Moment static export includes several integrated fixes that work together:

### 1. Hash-Based Routing

We use hash-based routing to ensure all URLs work correctly on GitHub Pages:

```
# Instead of: 
https://username.github.io/repo-name/products

# We use:
https://username.github.io/repo-name/#/products
```

Hash-based URLs are processed entirely client-side, which means GitHub Pages won't try to find a file at `/products` and return a 404 error.

### 2. Special 404.html Handler

For users who try to access direct URLs without the hash (e.g., when sharing links), we include a special 404.html file that:

1. Captures the path the user was trying to access
2. Redirects to the main application with the correct hash-based URL
3. Shows a friendly loading message during the redirection

### 3. Base URL Configuration

The export automatically sets the correct base URL for your GitHub repository:

```html
<base href="/repository-name/">
```

This ensures all relative paths resolve correctly.

### 4. Asset Path Correction

A special script detects when your site is running on GitHub Pages and dynamically fixes all asset URLs:

```javascript
// Transforms:
<img src="/images/logo.png">

// Into:
<img src="/repository-name/images/logo.png">
```

## How It Handles Different URL Scenarios

### Scenario 1: Direct Access to the Homepage

When a user visits `https://username.github.io/repo-name/`:
- The index.html loads normally
- Asset path fixer ensures all resources load correctly

### Scenario 2: Direct Access to a Subpage

When a user visits `https://username.github.io/repo-name/products`:
- GitHub Pages returns the 404.html page
- The 404.html script redirects to `https://username.github.io/repo-name/#/products`
- The app loads and shows the products page

### Scenario 3: Internal Navigation

When a user clicks an internal link:
- The app updates the hash portion of the URL (e.g., `/#/about`)
- React router shows the appropriate page
- No page reload happens, maintaining a smooth experience

### Scenario 4: Browser Back/Forward Navigation

- Hash-based routing works with browser history
- Users can use back/forward buttons to navigate between pages

## File Structure Role in URL Handling

The following files work together to handle URLs correctly:

- `index.html` - Main application with embedded hash router
- `404.html` - Catches all non-file URLs and redirects to the hash version
- `.nojekyll` - Tells GitHub not to process the site with Jekyll
- `asset-path-fixer.js` - Fixes all asset URLs for GitHub Pages

## Testing Your URL Handling

To verify everything is working correctly, test these scenarios:

1. Visit the site's home page directly
2. Try accessing a page directly with the hash format: `/#/products`
3. Try accessing a page directly without the hash: `/products` (should redirect)
4. Click internal links and verify navigation works
5. Use browser back/forward buttons
6. Share a direct link to a specific page and try accessing it from another browser

## Understanding URL Logs

When you open your browser console, you might see logs related to URL handling:

- "Not on GitHub Pages, asset path correction not needed" - When testing locally
- "Fixing asset path: /image.jpg → /repo-name/image.jpg" - When assets are being fixed
- "Converting direct path to hash route: /products" - When a direct URL is being processed

These logs help diagnose any potential URL-related issues.

## Advanced: Custom Domain Configuration

If you use a custom domain for your GitHub Pages site:

1. URL handling automatically switches to standard mode
2. The base URL becomes just `/` instead of `/repository-name/`
3. Asset path correction is no longer needed