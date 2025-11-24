#!/bin/bash

# ArtMapper JavaScript Test Runner

echo "🚀 Starting ArtMapper Test Application..."

# Start the application in background
node App.js &
APP_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Run tests
echo "🧪 Running tests..."
node test.js
TEST_EXIT_CODE=$?

# Stop the application
echo "🛑 Stopping application..."
kill $APP_PID 2>/dev/null

exit $TEST_EXIT_CODE

