# Sweet Moment - Static Website

This is a static version of the Sweet Moment Chocolates website, ready for GitHub Pages deployment.

## Deployment Instructions

### Simple Method (Using GitHub Actions)
1. Upload all these files to your GitHub repository
2. Go to your repository's Settings > Pages
3. Under "Build and deployment" > "Source", select "GitHub Actions"
4. Your site will automatically be deployed to GitHub Pages

### Troubleshooting
- Make sure your repository is public or you have GitHub Pages enabled on your account
- If the site doesn't appear immediately, check the Actions tab for deployment status
- The site will be available at https://yourusername.github.io/repositoryname/

## Important Files
- `.nojekyll` - Prevents GitHub's Jekyll processor from processing your files
- `.github/workflows/deploy.yml` - GitHub Actions workflow for automatic deployment
- `404.html` - Provides SPA routing support on GitHub Pages
