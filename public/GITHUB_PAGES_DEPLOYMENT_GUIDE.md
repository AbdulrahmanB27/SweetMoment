# GitHub Pages Deployment Guide for Sweet Moment

This guide provides detailed instructions for deploying the Sweet Moment static site to GitHub Pages, with special attention to the router configuration that prevents URL corruption issues.

## Preparing for Deployment

1. Extract all files from the ZIP archive to a local directory
2. Verify that the following files are present in the root directory:
   - `index.html`
   - `enhanced-router-fix.js`
   - `.nojekyll` (this file prevents GitHub Pages from using Jekyll processing)

## Creating a GitHub Repository

1. Log into your GitHub account
2. Create a new repository (e.g., "SweetMoment")
3. Make the repository public
4. Do not initialize it with a README, .gitignore, or license file

## Deploying to GitHub Pages

### Option 1: Using Git

1. Initialize a Git repository in your local directory:
   ```
   git init
   ```

2. Add all files to the repository:
   ```
   git add .
   ```

3. Commit the files:
   ```
   git commit -m "Initial commit"
   ```

4. Add your GitHub repository as the remote origin:
   ```
   git remote add origin https://github.com/YOUR-USERNAME/SweetMoment.git
   ```

5. Push to GitHub:
   ```
   git push -u origin main
   ```

6. Enable GitHub Pages:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"

### Option 2: Using GitHub Desktop

1. Open GitHub Desktop
2. Add the local folder as a repository
3. Publish the repository to GitHub
4. Enable GitHub Pages as described in Option 1, step 6

## Troubleshooting URL Issues

The package includes an enhanced router fix (v3.0) that prevents URL corruption issues that commonly occur when deploying Single Page Applications (SPAs) with client-side routing to GitHub Pages.

### If you experience URL corruption:

1. Ensure that `enhanced-router-fix.js` is properly included in your HTML file before any other scripts
2. Check that the repository name in the HTML matches your actual GitHub repository name
3. Verify that the `<base href="/YOUR-REPO-NAME/">` tag is present in the `<head>` section of your HTML
4. Clear your browser cache and reload the page

### Common URL Corruption Patterns Fixed:

- `/~and~/` segments appearing in URLs
- Repository name duplication in paths
- Endless page refreshing
- Double slashes in URLs
- Query parameter encoding issues

## Testing Your Deployment

1. Your site should be available at `https://YOUR-USERNAME.github.io/SweetMoment/`
2. Try navigating to different pages using the menu
3. Refresh the page on different routes to ensure the routing works correctly
4. Check the browser console for any errors

## Manual Router Fix Implementation

If you need to manually implement the router fix in your own project:

1. Include this script in your HTML before any other scripts:
   ```html
   <script>
     // Set up global configuration
     window.REPO_NAME = 'SweetMoment'; // Change to your repository name
   </script>
   <script src="enhanced-router-fix.js"></script>
   ```

2. Add a base tag in the head section:
   ```html
   <base href="/SweetMoment/"> <!-- Change to your repository name -->
   ```

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Single Page Applications on GitHub Pages](https://github.blog/2016-08-17-simpler-github-pages-publishing/)
- [Creating a 404.html for SPA routing](https://github.blog/2016-08-22-publish-your-project-documentation-with-github-pages/)

For any further assistance, contact the Sweet Moment development team.