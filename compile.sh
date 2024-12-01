#!/bin/bash

# Clean previous builds
rm -rf dist build *.zip

# Compile TypeScript
echo "Compiling TypeScript files..."
npx tsc

# Extract name and version from manifest.json
EXT_NAME=$(grep '"name"' manifest.json | head -1 | sed 's/.*"name": *"\(.*\)",*/\1/' | sed 's/ /_/g')
EXT_VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*"version": *"\(.*\)",*/\1/')

# Create build directory
echo "Creating build directory..."
mkdir build
cp -r assets dist lib sidePanel.html manifest.json build/

# Package the extension
PACKAGE_NAME="${EXT_NAME}-${EXT_VERSION}.zip"
echo "Packaging extension as ${PACKAGE_NAME}..."
cd build
zip -r "../releases/${PACKAGE_NAME}" .
cd ..

echo "Extension packaged successfully: ${PACKAGE_NAME}"