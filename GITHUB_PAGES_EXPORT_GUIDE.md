# Sweet Moment GitHub Pages Export & Deployment Guide

This comprehensive guide explains how to export and deploy your Sweet Moment site to GitHub Pages with full multi-page functionality. The process has been carefully designed to avoid the common "blank screen" issue and ensure all pages work correctly.

## Step 1: Generate the Static Export

First, you'll need to generate a static export of your Sweet Moment site:

1. Log in to your Sweet Moment admin panel
2. Navigate to the "Export" or "Tools" section
3. Select "Generate GitHub Pages Export"
4. Enter your GitHub username and repository name (or leave empty if you're not sure yet)
5. Click "Generate Export" and wait for the process to complete
6. Download the ZIP file when prompted

## Step 2: Create a GitHub Repository

1. Sign in to your GitHub account at [github.com](https://github.com)
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "sweet-moment-site")
4. Make sure the repository is set to "Public" (required for GitHub Pages)
5. Do not initialize the repository with a README or any other files
6. Click "Create repository"

## Step 3: Upload Your Static Export

### Option 1: Upload via GitHub Web Interface

1. In your new empty repository, click "uploading an existing file"
2. Extract the ZIP file you downloaded to a local folder
3. Drag and drop all files from the extracted folder to GitHub
4. Add a commit message like "Initial Sweet Moment site upload"
5. Click "Commit changes"

### Option 2: Upload via Git Command Line

1. Extract the ZIP file to a local folder
2. Open a terminal or command prompt in that folder
3. Run the following commands, replacing the URL with your repository URL:

```bash
git init
git add .
git commit -m "Initial Sweet Moment site upload"
git remote add origin https://github.com/yourusername/your-repository.git
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" in the top navigation
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" (or "master") branch
5. Click "Save"
6. Wait a few minutes for GitHub to build your site

## Step 5: Check Your Deployed Site

1. In the GitHub Pages section, you'll see a message like "Your site is published at https://yourusername.github.io/your-repository/"
2. Click this link to view your site
3. Test that all pages work by clicking through the navigation
4. Try accessing pages directly using these patterns:
   - Home: `https://yourusername.github.io/your-repository/`
   - Products: `https://yourusername.github.io/your-repository/#/products`
   - Categories: `https://yourusername.github.io/your-repository/#/categories`
   - About: `https://yourusername.github.io/your-repository/#/about`
   - Contact: `https://yourusername.github.io/your-repository/#/contact`

## How Multi-Page Navigation Works

Your Sweet Moment static export uses hash-based routing (`/#/page-name`) to enable multi-page navigation without server configuration. This approach ensures:

1. All pages are accessible through direct links
2. Browser back/forward buttons work correctly
3. Page transitions feel like a traditional website
4. The site works perfectly on GitHub Pages

## Technical Details

### Key Files for GitHub Pages Compatibility

- `404.html` - Handles direct navigation to pages via URL
- `.nojekyll` - Prevents GitHub from processing your site with Jekyll
- `asset-path-fixer.js` - Ensures all assets load correctly
- `page-navigation.js` - Provides the multi-page navigation experience

### How URL Handling Works

When a user visits a direct URL like `https://yourusername.github.io/your-repository/products`:

1. GitHub Pages serves the 404.html page
2. The 404.html script detects the intended path (/products)
3. It redirects to `https://yourusername.github.io/your-repository/#/products`
4. The React app loads with the hash route
5. The user sees the products page as expected

## Troubleshooting

If you encounter issues:

1. **Blank Screen**: Check the browser console for errors. This usually indicates a path issue with assets not loading.
2. **Missing Images**: Ensure all image paths use relative URLs or are properly handled by the asset path fixer.
3. **404 Page Not Redirecting**: Make sure the 404.html file is in the root of your repository.

## Advanced Customization

To customize your GitHub Pages deployment:

1. **Custom Domain**: In your repository settings, you can add a custom domain.
2. **Site Metadata**: Edit the `index.html` to update title, description, and social media tags.
3. **Tracking**: Add analytics code to `index.html` if needed.

## Further Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Sweet Moment guides included in your export:
  - GITHUB_PAGES_PATH_FIX.md - Explains how asset paths are fixed
  - MULTI_PAGE_GUIDE.md - Details about the multi-page functionality
  - GITHUB_PAGES_404_FIX.md - Explanation of the 404 page handling