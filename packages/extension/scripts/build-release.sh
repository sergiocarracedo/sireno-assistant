#!/bin/bash

# Chrome Web Store Release Build Script
# Creates a production-ready zip file for the extension

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building Sireno Assistant for Chrome Web Store${NC}"
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}📦 Version: ${VERSION}${NC}"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist/

# Run production build
echo -e "${YELLOW}🔨 Building extension (production mode)...${NC}"
pnpm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

# Create releases directory
RELEASES_DIR="../../releases"
mkdir -p "$RELEASES_DIR"

# Create zip file
ZIP_NAME="sireno-assistant-v${VERSION}.zip"
ZIP_PATH="${RELEASES_DIR}/${ZIP_NAME}"

echo -e "${YELLOW}📦 Creating release package...${NC}"
cd dist
zip -r "$ZIP_PATH" ./* -x "*.map" -x "*.DS_Store"
cd ..

# Get file size
FILE_SIZE=$(ls -lh "$ZIP_PATH" | awk '{print $5}')

echo ""
echo -e "${GREEN}✅ Release build complete!${NC}"
echo ""
echo -e "${GREEN}Package details:${NC}"
echo -e "  📁 Location: ${ZIP_PATH}"
echo -e "  📊 Size: ${FILE_SIZE}"
echo -e "  🏷️  Version: ${VERSION}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Upload to Chrome Web Store Developer Dashboard"
echo "  2. Go to: https://chrome.google.com/webstore/devconsole"
echo "  3. Select your extension or create a new one"
echo "  4. Upload ${ZIP_NAME}"
echo "  5. Fill in store listing details and submit for review"
echo ""
