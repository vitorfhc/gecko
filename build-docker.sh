#!/bin/bash
set -euo pipefail

# Check if an argument was provided
if [ -z "${1:-}" ]; then
    echo "Usage: ./build-docker.sh [chrome|ff]"
    exit 1
fi

TARGET=$1

if [ "$TARGET" != "chrome" ] && [ "$TARGET" != "ff" ]; then
    echo "Error: Invalid target. Use 'chrome' or 'ff'."
    exit 1
fi

echo "Building Gecko for $TARGET using Docker..."

# Build inside the image and export only the resulting dist folder. Files are
# written by the Docker client, so they belong to the current user.
rm -rf dist
docker build --build-arg TARGET="$TARGET" --output type=local,dest=dist .

echo "Build complete. Check the 'dist' folder."
