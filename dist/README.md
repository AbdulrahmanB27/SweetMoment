# Sweet Moment - Static Website

This is a static version of the Sweet Moment Chocolates website, ready for GitHub Pages deployment.

## Deployment Instructions

### Direct Deployment Method (Recommended)
1. Create a new GitHub repository named `SweetMoment`
2. Upload ALL files from this folder to the repository
3. Go to your repository's Settings > Pages
4. Under "Build and deployment" > "Source", select "Deploy from a branch"
5. Select the branch (e.g., `main`) and folder (select `/ (root)`)
6. Click "Save" and wait for the deployment to complete

### Troubleshooting
- Make sure your repository name is exactly `SweetMoment` (case-sensitive)
- Make sure your repository is public or you have GitHub Pages enabled on your account
- If the site doesn't appear immediately, check the repository settings
- The site will be available at https://yourusername.github.io/SweetMoment/

## Important Files
- `.nojekyll` - Prevents GitHub's Jekyll processor from processing your files
- `404.html` - Provides SPA routing support on GitHub Pages
- `index.html` - Contains the necessary redirect scripts for GitHub Pages
