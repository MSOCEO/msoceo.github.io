#!/bin/bash
# Post-build restructuring for correct GitHub Pages deployment.
# Moves all blog content into dist/blog/ (for base: /blog/)
# and places the portal page at dist/index.html (for root /).
set -e

# Save portal page before moving everything
if [ -f dist/portal-index.html ]; then
  cp dist/portal-index.html /tmp/portal-index.html
fi

# Move all dist contents into dist/blog/
mkdir -p dist/blog
for item in dist/*; do
  if [ "$item" != "dist/blog" ]; then
    mv "$item" dist/blog/ 2>/dev/null || true
  fi
done

# Restore portal as root index
if [ -f /tmp/portal-index.html ]; then
  cp /tmp/portal-index.html dist/index.html
  rm -f /tmp/portal-index.html
fi
