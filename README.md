# Sweet Moment Static Site

This is a static version of the Sweet Moment website generated on 5/14/2025, 10:22:54 PM.

## Deployment Instructions

1. Extract all files from this ZIP archive
2. Deploy to a static hosting service like GitHub Pages
3. For GitHub Pages:
   - Create a new repository on GitHub
   - Push these files to the repository
   - Go to Settings > Pages and select the main branch for deployment

## Enhanced Router Fix Implemented

This static version includes an enhanced router fix (v3.0) that prevents URL corruption issues on GitHub Pages:

- Prevents the infinite "/~and~/" URL corruption issue that occurs with the wouter router
- Stops endless page refreshing and URL mangling
- Handles multiple URL corruption patterns automatically
- Works with browser navigation and history properly

If you encounter any URL issues, make sure that the `enhanced-router-fix.js` script is properly loaded in your HTML.

## Configuration

- Base URL: /SweetMoment/
- Generated: 2025-05-14T22:22:54.232Z

For more details, see the GITHUB_PAGES_DEPLOYMENT_GUIDE.md file.
