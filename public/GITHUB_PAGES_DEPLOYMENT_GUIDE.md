# GitHub Pages Deployment Guide for Sweet Moment

This guide will help you deploy your Sweet Moment static site to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Basic knowledge of Git
3. The Sweet Moment static site package (which you already have)

## Step 1: Create a GitHub Repository

1. Log in to your GitHub account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "sweet-moment" or whatever you prefer)
4. Set the repository to "Public" (required for GitHub Pages on a free account)
5. Initialize with a README file (optional but recommended)
6. Click "Create repository"

## Step 2: Upload the Static Site Files

### Option 1: Using GitHub Web Interface (Easiest)

1. Navigate to your new repository on GitHub
2. Click the "Add file" button and choose "Upload files"
3. Extract the ZIP file you downloaded from Sweet Moment on your computer
4. Drag and drop all the extracted files into the GitHub upload area
5. Add a commit message like "Initial upload of Sweet Moment static site"
6. Click "Commit changes"

### Option 2: Using Git Command Line (Advanced)

If you're comfortable with Git commands:

1. Extract the ZIP file to a folder on your computer
2. Open a terminal/command prompt in that folder
3. Initialize a Git repository:
   ```
   git init
   ```
4. Add the GitHub repository as a remote:
   ```
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   ```
5. Add all files to Git:
   ```
   git add .
   ```
6. Commit the files:
   ```
   git commit -m "Initial commit of Sweet Moment static site"
   ```
7. Push to GitHub:
   ```
   git push -u origin main
   ```
   (Note: Use `master` instead of `main` if you're using an older Git version)

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" (top right, near the gear icon)
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch (or "master" if that's what you used)
5. Click "Save"
6. After a few minutes, your site will be published at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## Step 4: Verify Your Deployment

1. Wait a few minutes for GitHub to build and deploy your site
2. Visit the URL provided in the GitHub Pages section
3. Verify that your Sweet Moment site loads correctly with all images and functionality

## Troubleshooting Common Issues

### Broken Images or Links

If images or links are broken:
- Make sure the `window.REPO_NAME` in the enhanced-router-fix.js file matches your actual repository name
- Check that all paths in the site are relative or hash-based

### 404 Errors on Refresh or Direct Access

This should be automatically handled by the enhanced router fix script and the 404.html redirect, but if you experience issues:
- Ensure you didn't modify or delete the 404.html file
- Verify that the enhanced-router-fix.js file is included in your repository
- Make sure your repository name is correctly set

### Infinite Refresh Loop

If the site keeps refreshing endlessly:
- Clear your browser cache and cookies
- Try using incognito/private browsing mode
- Verify that the `window.USE_HASH_ROUTER` value is set to `true` in index.html

## Need Help?

If you're still experiencing issues, please:
1. Check the browser console for error messages (F12 > Console)
2. Take screenshots of any errors
3. Contact Sweet Moment support with details of your issue

---

Happy deploying! Your Sweet Moment site should now be live and accessible worldwide.