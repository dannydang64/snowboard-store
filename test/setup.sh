#!/bin/bash

# Setup script for Snow Ice test framework
echo "Setting up Snow Ice test framework..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install test-specific dependencies
echo "Installing test-specific dependencies..."
cd ..
npm install --save-dev jest jest-puppeteer puppeteer axios faker

# Create directories
echo "Creating directories..."
mkdir -p reports/screenshots

echo "Setup complete!"
echo "To run tests, use: node run-tests.js"
echo "For help, use: node run-tests.js --help"
