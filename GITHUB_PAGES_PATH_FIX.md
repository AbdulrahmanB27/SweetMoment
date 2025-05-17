# GitHub Pages Path Fix Guide

This guide explains how to fix the common "blank screen" issue when deploying Sweet Moment to GitHub Pages.

## The Problem

When deploying a React Single Page Application (SPA) to GitHub Pages, you often encounter one of these problems:

1. **Blank Screen** - The site loads but shows a blank/white page with no errors in the console
2. **404 Not Found** - The site shows GitHub's default 404 page instead of your app
3. **Missing Assets** - The site partially loads but images, styles, or scripts are missing

These issues occur because GitHub Pages serves your site at a URL like `https://username.github.io/repository-name/` instead of at the root path `/`.

## Our Solution

The Sweet Moment static export includes several integrated fixes that work together to solve these issues:

### 1. Asset Path Correction

The export automatically detects GitHub Pages hosting and adds the repository name to all asset paths:

```javascript
// Before: <img src="/image.jpg">
// After:  <img src="/repository-name/image.jpg">
```

### 2. Base URL Configuration

The export sets the correct base URL for all relative paths:

```html
<base href="/repository-name/">
```

### 3. Hash-Based Routing

Instead of browser-based routing which causes 404s on GitHub Pages, we use hash-based routing:

```
# Instead of: https://username.github.io/repository-name/products
# We use:     https://username.github.io/repository-name/#/products
```

### 4. Special 404.html Page

For direct navigation to pages (like sharing links), we include a special 404.html that:

1. Captures the intended URL path
2. Redirects to the main page with the correct hash-based route
3. Preserves all URL parameters

### 5. .nojekyll File

GitHub Pages treats repositories as Jekyll sites by default, which can cause routing issues. The .nojekyll file prevents this behavior.

## How It All Works Together

1. User visits `https://username.github.io/repository-name/products`
2. GitHub Pages serves the 404.html page (since /products doesn't exist as a file)
3. The 404.html script detects the intended path (/products)
4. It redirects to `https://username.github.io/repository-name/#/products`
5. The main app loads with the hash route
6. Asset path fixer ensures all images and resources load correctly

## Testing the Fix

After deploying to GitHub Pages, try these tests:

1. Visit your main site URL: `https://username.github.io/repository-name/`
2. Try a direct product page: `https://username.github.io/repository-name/products`
3. Check that all images and styles load correctly
4. Verify that navigation between pages works

If everything displays correctly with no blank screens or missing assets, the fix is working!

## Manual Adjustments (If Needed)

If you still see issues, check:

1. Repository name is correct in all generated files
2. All assets are properly included in the repository
3. GitHub Pages is enabled in your repository settings

## Further Reading

For more details, see the comprehensive guides included with your export:

- GITHUB_PAGES_DEPLOYMENT_GUIDE.md
- MULTI_PAGE_GUIDE.md
- GITHUB_PAGES_404_FIX.md