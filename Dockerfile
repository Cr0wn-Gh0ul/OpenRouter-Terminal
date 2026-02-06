# Dockerfile for building OpenRouterCLI SEA binaries
# 
# The build now uses Docker's --platform flag directly:
#   docker run --rm --platform linux/arm64 -v "$PWD":/app -w /app node:22-bookworm-slim ./scripts/build-sea.sh
#
# This Dockerfile is kept for optional use cases but the main build
# script (build-sea-all.sh) runs Docker commands directly.

FROM node:22-bookworm-slim

WORKDIR /app

# Default entry - can be overridden
CMD ["bash"]
