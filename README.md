# Sweet Moment Static Site

This is an all-in-one static export of the Sweet Moment chocolate shop website, optimized for GitHub Pages deployment.

## Deployment Instructions

1. Create a new GitHub repository named `SweetMoment`
2. Upload all files in this folder to the repository
3. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Set the source to "Deploy from a branch"
   - Select your "main" branch and "/" (root) folder
   - Click Save
4. Your site will be available at `https://abdulrahmanb72.github.io/SweetMoment/`

## Features of This Export

- All JavaScript, CSS, and data are embedded directly in the HTML files
- No external dependencies except for image files
- Works with both GitHub Pages and custom domains
- Multi-page navigation with hash-based routing
- Includes product images in the uploads folder
- 404.html redirect for handling direct deep links

## Important Files

- `index.html` - The main application with all code embedded
- `404.html` - Identical copy of index.html for GitHub Pages redirect handling
- `.nojekyll` - Prevents GitHub from processing the site with Jekyll
- `uploads/` - Contains all product images

## Customization

If you need to change the repository name after generating this export, simply edit the `REPO_NAME` variable in both HTML files.

## Note on Dynamic Features

As this is a static export, the following features are not available:
- Shopping cart and checkout functionality
- User authentication
- Order processing

This static version is intended for showcasing products and information only.