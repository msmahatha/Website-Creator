#!/bin/bash
# start-robust-server.sh - Start the AI-powered self-healing server

echo "🚀 Starting AI-Powered Website Inspector with Self-Healing Server..."
echo "======================================================================"
echo ""

# Kill any existing server processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*server" 2>/dev/null || true
sleep 2

# Check for required dependencies
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "⚠️  No package.json found. Installing basic dependencies..."
    npm init -y
    npm install express axios cors
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready"
echo ""

# Start the watchdog (which starts the server)
echo "🐕 Starting AI-Powered Server Watchdog..."
echo "   • Automatic error detection and healing"
echo "   • Auto-restart on failures"
echo "   • Health monitoring every 5 seconds"
echo "   • Circuit breaker protection"
echo "   • Memory management"
echo ""

echo "🌐 Server will be available at: http://localhost:3000"
echo "📊 AI Health endpoint: http://localhost:3000/ai-health"
echo "📈 Recovery stats: http://localhost:3000/recovery-stats"
echo ""

echo "Press Ctrl+C to stop the server"
echo "======================================================================"

# Start the watchdog
node server-watchdog.js
