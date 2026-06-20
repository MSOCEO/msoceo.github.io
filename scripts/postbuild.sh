#!/bin/bash
# Post-build restructuring for correct GitHub Pages deployment.
# Moves all blog content into dist/blog/ (for base: /blog/)
# and places the portal page at dist/index.html (for root /).
set -e

# Save portal page before moving everything
if [ -f dist/portal-index.html ]; then
  cp dist/portal-index.html /tmp/portal-index.html
fi

# Save existing dist/blog/ contents to avoid being overwritten by dist/* → dist/blog/ move.
# This preserves pages like src/pages/blog/index.astro (→ dist/blog/index.html)
# which would otherwise be clobbered by dist/index.html (the site root page).
BLOG_SAVE=$(mktemp -d)
if [ -d dist/blog ] && [ "$(ls -A dist/blog 2>/dev/null)" ]; then
  cp -a dist/blog/ "$BLOG_SAVE/"
fi

# Move all dist contents into dist/blog/
mkdir -p dist/blog
for item in dist/*; do
  if [ "$item" != "dist/blog" ]; then
    mv "$item" dist/blog/ 2>/dev/null || true
  fi
done

# Restore previously saved dist/blog/ contents, overwriting conflicts.
# This ensures pages like blog/index.html (built by Astro) take precedence over
# the root index.html that was moved into dist/blog/ by the mass move above.
if [ -d "$BLOG_SAVE/blog" ] || [ "$(ls -A "$BLOG_SAVE" 2>/dev/null)" ]; then
  cp -af "$BLOG_SAVE"/* dist/blog/ 2>/dev/null || true
fi
rm -rf "$BLOG_SAVE"

# Restore portal as root index
if [ -f /tmp/portal-index.html ]; then
  cp /tmp/portal-index.html dist/index.html
  rm -f /tmp/portal-index.html
fi

# Replace blog homepage with custom theme (if present)
if [ -f dist/blog/hanying-blog-theme.html ]; then
  cp dist/blog/hanying-blog-theme.html dist/blog/index.html
  echo "✓ Blog homepage replaced with custom theme"
fi
