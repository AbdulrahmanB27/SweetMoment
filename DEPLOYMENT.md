# GitHub Pages Deployment Instructions

## Quick Deploy to GitHub Pages

1. **Extract the ZIP file** to get all the static site files

2. **Push to GitHub:**
   ```bash
   # Navigate to the extracted folder
   cd sweet-moment-static
   
   # Initialize git (if not already done)
   git init
   git add .
   git commit -m "Deploy Sweet Moment Chocolates static site"
   
   # Add your GitHub repository as remote
   git remote add origin https://github.com/YOUR-USERNAME/SweetMoment.git
   
   # Push to GitHub (creates or updates gh-pages branch)
   git push -f origin main:gh-pages
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click Settings → Pages
   - Under "Source", select the gh-pages branch
   - Click Save
   - Your site will be live at: https://YOUR-USERNAME.github.io/SweetMoment/

## Important Notes:

- **Images**: All images are in the uploads/ folder and use relative paths
- **Links**: All navigation uses relative links (index.html, menu.html, etc.)
- **.nojekyll file**: Included to prevent GitHub Pages from processing files with Jekyll
- **Base path**: Currently set to . which works for both root and subdirectory deployment

## Payment Redirect Configuration:

To enable payment redirects (Order Now buttons):
1. Go to your main site admin panel
2. Navigate to Site Customization → Static Site tab  
3. Enable "Payment Redirect"
4. Enter your payment provider URL (e.g., Stripe checkout link)
5. Save settings
6. Re-generate the static site
7. Re-deploy to GitHub Pages

Product details (name, price, ID) will automatically be added as URL parameters to your payment URL.

Generated: 2025-10-20T16:03:47.391Z
