#!/usr/bin/env sh
# Copy the production build to the repository root so GitHub Pages can serve
# the branch directly ("Deploy from a branch" with folder "/ (root)").
set -e
cd "$(dirname "$0")"
npm run build
rm -rf assets
cp -r dist/assets assets
cp dist/index.html index.html
cp dist/favicon.svg favicon.svg
touch .nojekyll
echo "Built site copied to repository root."
