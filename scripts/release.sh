#!/bin/bash
set -e

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Get the type of release (patch, minor, major)
RELEASE_TYPE=${1:-patch}

# Calculate new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
case $RELEASE_TYPE in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Usage: $0 [patch|minor|major]"
    exit 1
    ;;
esac
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo "Releasing v$NEW_VERSION (was $CURRENT_VERSION)"

# Update package.json version
npm version $NEW_VERSION --no-git-tag-version

# Generate changelog from commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  COMMITS=$(git log $LAST_TAG..HEAD --pretty=format:"- %s" --no-merges)
else
  COMMITS=$(git log --pretty=format:"- %s" --no-merges)
fi

# Prepend to CHANGELOG.md
CHANGELOG_ENTRY="## v$NEW_VERSION ($(date +%Y-%m-%d))

$COMMITS
"

if [ -f CHANGELOG.md ]; then
  echo -e "$CHANGELOG_ENTRY\n$(cat CHANGELOG.md)" > CHANGELOG.md
else
  echo "$CHANGELOG_ENTRY" > CHANGELOG.md
fi

echo ""
echo "Changelog:"
echo "$CHANGELOG_ENTRY"
echo ""

# Commit and tag
git add package.json package-lock.json CHANGELOG.md
git commit -m "release: v$NEW_VERSION"
git tag "v$NEW_VERSION"

echo ""
echo "Created tag v$NEW_VERSION"
echo ""
echo "Run this to push:"
echo "  git push origin main && git push origin v$NEW_VERSION"
