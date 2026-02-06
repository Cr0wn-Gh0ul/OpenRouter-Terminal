#!/bin/bash

# Build script for OpenRouter Terminal Single Executable Application
# Builds for both Linux and macOS (must run on respective platform)

set -e

BINARY_NAME="openrouter"
NODE_VERSION=$(node -v)

echo "Building OpenRouter Terminal SEA..."
echo "Node.js version: $NODE_VERSION"
echo ""

# Step 1: Compile TypeScript to CommonJS
echo "[1/4] Compiling TypeScript..."
npm run build:cjs

# Step 2: Generate the SEA blob
echo "[2/4] Generating SEA blob..."
node --experimental-sea-config sea-config.json

# Step 3: Detect platform and copy Node binary
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [ "$ARCH" = "x86_64" ]; then
    ARCH="x64"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    ARCH="arm64"
fi

echo "[3/4] Creating executable for $PLATFORM-$ARCH..."

mkdir -p bin

if [ "$PLATFORM" = "darwin" ]; then
    OUTPUT_NAME="${BINARY_NAME}-macos-${ARCH}"
    cp $(command -v node) "bin/$OUTPUT_NAME"
    
    # Remove signature (required on macOS)
    codesign --remove-signature "bin/$OUTPUT_NAME"
    
    # Inject the blob
    npx postject "bin/$OUTPUT_NAME" NODE_SEA_BLOB sea-prep.blob \
        --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
        --macho-segment-name NODE_SEA
    
    # Re-sign (ad-hoc signature for local use)
    codesign --sign - "bin/$OUTPUT_NAME"
    
elif [ "$PLATFORM" = "linux" ]; then
    OUTPUT_NAME="${BINARY_NAME}-linux-${ARCH}"
    cp $(command -v node) "bin/$OUTPUT_NAME"
    
    # Inject the blob
    npx postject "bin/$OUTPUT_NAME" NODE_SEA_BLOB sea-prep.blob \
        --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
else
    echo "Unsupported platform: $PLATFORM"
    exit 1
fi

# Step 4: Cleanup
echo "[4/4] Cleaning up..."
rm -f sea-prep.blob

chmod +x "bin/$OUTPUT_NAME"

echo ""
echo "Build complete!"
echo "Binary: bin/$OUTPUT_NAME"
echo "Size: $(du -h "bin/$OUTPUT_NAME" | cut -f1)"
