#!/bin/bash
set -e

echo "🔍 Running Coverage Checks..."

# 1. Smart Contract Coverage
if [ -d "contracts" ]; then
    echo "📦 Checking Smart Contract Coverage..."
    npx hardhat coverage
fi

# 2. Frontend Coverage (if applicable/configured)
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "🖥️ Checking Frontend Coverage..."
    cd frontend
    if grep -q "test:coverage" package.json; then
        npm run test:coverage
    else
        echo "⚠️  Frontend 'test:coverage' script not found. Skipping."
    fi
    cd ..
fi

echo "✅ All coverage checks passed!"
