#!/bin/bash

# Build script for OpenRouter Terminal SEA - All platforms
# Uses Docker with --platform for cross-compilation (requires QEMU for non-native)
# Falls back to native-only build if cross-platform emulation isn't available

set -e

BINARY_NAME="openrouter"
NODE_VERSION="22"

# Detect current platform
CURRENT_ARCH=$(uname -m)
if [ "$CURRENT_ARCH" = "x86_64" ]; then
    NATIVE_DOCKER_PLATFORM="linux/amd64"
    NATIVE_PLATFORM="linux-x64"
elif [ "$CURRENT_ARCH" = "aarch64" ] || [ "$CURRENT_ARCH" = "arm64" ]; then
    NATIVE_DOCKER_PLATFORM="linux/arm64"
    NATIVE_PLATFORM="linux-arm64"
else
    echo "Unsupported architecture: $CURRENT_ARCH"
    exit 1
fi

# All platforms we want to build
declare -A PLATFORMS=(
    ["linux-x64"]="linux/amd64"
    ["linux-arm64"]="linux/arm64"
)

echo "========================================"
echo "OpenRouter Terminal SEA Multi-Platform Build"
echo "========================================"
echo "Node.js version: ${NODE_VERSION}"
echo "Native platform: ${NATIVE_PLATFORM}"
echo ""

# Step 1: Compile TypeScript to bundled CommonJS
echo "[1/3] Compiling TypeScript..."
npm run build:cjs

# Step 2: Create output directory
mkdir -p bin

# Step 3: Build for each platform using Docker
echo "[2/3] Building platform binaries..."

for PLATFORM in "${!PLATFORMS[@]}"; do
    DOCKER_PLATFORM="${PLATFORMS[$PLATFORM]}"
    OUTPUT_NAME="${BINARY_NAME}-${PLATFORM}"
    
    echo ""
    
    # Check if this is the native platform or if we can emulate
    if [ "$DOCKER_PLATFORM" = "$NATIVE_DOCKER_PLATFORM" ]; then
        echo "  Building for $PLATFORM (native)..."
    else
        # Try to check if QEMU is available for this platform
        if ! docker run --rm --platform "$DOCKER_PLATFORM" "node:${NODE_VERSION}-bookworm-slim" echo "ok" >/dev/null 2>&1; then
            echo "  Skipping $PLATFORM (QEMU emulation not available)"
            echo "    Run 'docker run --privileged --rm tonistiigi/binfmt --install all' to enable"
            continue
        fi
        echo "  Building for $PLATFORM (docker: $DOCKER_PLATFORM)..."
    fi
    
    docker run --rm --platform "$DOCKER_PLATFORM" \
        -v "$PWD":/app \
        -w /app \
        "node:${NODE_VERSION}-bookworm-slim" \
        sh -c "node --experimental-sea-config sea-config.json && \
               cp \$(command -v node) /app/bin/${OUTPUT_NAME} && \
               npx -y postject /app/bin/${OUTPUT_NAME} NODE_SEA_BLOB sea-prep.blob \
                   --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 && \
               chmod +x /app/bin/${OUTPUT_NAME} && \
               rm -f sea-prep.blob"
    
    # Try to chmod again on host (may fail if Docker user differs)
    chmod +x "bin/${OUTPUT_NAME}" 2>/dev/null || true
    
    SIZE=$(du -h "bin/${OUTPUT_NAME}" | cut -f1)
    echo "    Done: bin/${OUTPUT_NAME} (${SIZE})"
done

echo ""
echo "[3/3] Cleaning up..."
rm -f sea-prep.blob

echo ""
echo "========================================"
echo "Build complete!"
echo "========================================"
echo ""
echo "Binaries:"
for PLATFORM in "${!PLATFORMS[@]}"; do
    OUTPUT_NAME="${BINARY_NAME}-${PLATFORM}"
    if [ -f "bin/${OUTPUT_NAME}" ]; then
        SIZE=$(du -h "bin/${OUTPUT_NAME}" | cut -f1)
        if [ "$PLATFORM" = "$NATIVE_PLATFORM" ]; then
            echo "  bin/${OUTPUT_NAME} (${SIZE}) [native]"
        else
            echo "  bin/${OUTPUT_NAME} (${SIZE})"
        fi
    fi
done
echo ""
echo "Note: macOS binaries must be built on macOS (GitHub Actions)."
echo "      For ARM builds on x64, install QEMU: docker run --privileged --rm tonistiigi/binfmt --install all"
