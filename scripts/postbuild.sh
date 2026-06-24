#!/bin/bash
# Post-build: prepare dist/ for deployment.
# The deploy workflow (deploy.yml) copies individual projects into dist/ after this runs.
set -e

mkdir -p dist

# Copy blog (Xusu 2.0 static export with basePath=/blog) into dist/
if [ -d blog ]; then
  cp -r blog dist/
  echo "✓ Blog (Xusu 2.0) copied to dist/blog/"
fi

# Copy zeroblog into dist/
if [ -d zeroblog ]; then
  cp -r zeroblog dist/
  echo "✓ ZeroBlog copied to dist/zeroblog/"
fi

# Copy portal page as potential root index
if [ -f portal.html ]; then
  cp portal.html dist/portal-index.html
  echo "✓ Portal saved as dist/portal-index.html"
fi
