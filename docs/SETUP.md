# Detailed Setup Instructions

This guide provides comprehensive setup instructions for Website Inspector Pro in various environments.

## Prerequisites

### System Requirements
- **Node.js**: Version 16.0.0 or higher
- **NPM**: Version 8.0.0 or higher  
- **Memory**: At least 512MB RAM available
- **Disk Space**: 100MB for installation
- **Network**: Internet connection for external URL inspection

### Platform Support
- ✅ **macOS** 10.15+
- ✅ **Linux** Ubuntu 18.04+, CentOS 7+
- ✅ **Windows** 10+
- ✅ **Docker** Any platform with Docker support

## Installation Methods

### Method 1: Quick Install (Recommended)

```bash
# One-line installation and start
curl -fsSL https://raw.githubusercontent.com/yourusername/website-inspector-pro/main/install.sh | bash
```

### Method 2: Git Clone

```bash
# Clone the repository
git clone https://github.com/yourusername/website-inspector-pro.git
cd website-inspector-pro

# Install dependencies
npm install

# Start the server
npm run robust
```

### Method 3: NPM Global Install

```bash
# Install globally
npm install -g website-inspector-pro

# Start anywhere
website-inspector
```

### Method 4: Docker

```bash
# Using Docker
docker run -p 3000:3000 website-inspector-pro

# Using Docker Compose
curl -O https://raw.githubusercontent.com/yourusername/website-inspector-pro/main/docker-compose.yml
docker-compose up
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# AI Healing Configuration
MAX_RESTARTS=10
HEALTH_CHECK_INTERVAL=5000
HEALING_COOLDOWN=5000

# Auto-Recovery Configuration
CIRCUIT_BREAKER_THRESHOLD=3
CIRCUIT_BREAKER_TIMEOUT=300000
REQUEST_TIMEOUT=25000

# Monitoring Configuration
LOG_LEVEL=info
ENABLE_METRICS=true
```

### Advanced Configuration

Edit `self-healing-server.js` for custom configurations:

```javascript
// Custom healing strategies
class CustomHealingStrategy {
    constructor() {
        this.name = 'Custom Strategy';
        this.priority = 1;
    }

    async heal(error) {
        // Your custom healing logic
        return 'Custom healing applied';
    }
}

// Add to healer
healer.addStrategy(new CustomHealingStrategy());
```

## Verification

### Health Check

```bash
# Check if server is running
curl http://localhost:3000/ai-health

# Expected response:
{
  "healingCount": 0,
  "lastHealing": 0,
  "uptime": 123.456,
  "memory": {
    "rss": 12345678,
    "heapTotal": 8765432,
    "heapUsed": 5432109
  }
}
```

### Functionality Test

```bash
# Run comprehensive tests
npm test

# Test specific URL
curl -X POST http://localhost:3000/fetch-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Performance Test

```bash
# Install autocannon for load testing
npm install -g autocannon

# Run load test
autocannon -c 100 -d 30 http://localhost:3000/ai-health
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

**Permission Denied**
```bash
# Make scripts executable
chmod +x start-robust-server.sh
chmod +x server-watchdog.js
chmod +x test-ai-healing.js
```

**Module Not Found**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Memory Issues**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 self-healing-server.js
```

### Debugging

Enable debug mode:

```bash
# Start with debug logs
DEBUG=* npm start

# Or use Node.js inspector
node --inspect self-healing-server.js
```

Check logs:

```bash
# View real-time logs
tail -f logs/server.log

# Check system logs (Linux/macOS)
journalctl -u website-inspector -f
```

## Platform-Specific Instructions

### macOS

```bash
# Install Node.js via Homebrew
brew install node

# Install via MacPorts
sudo port install nodejs16

# Start as LaunchAgent
cp docs/macos/com.website-inspector.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.website-inspector.plist
```

### Linux (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create systemd service
sudo cp docs/linux/website-inspector.service /etc/systemd/system/
sudo systemctl enable website-inspector
sudo systemctl start website-inspector
```

### Windows

```powershell
# Install Node.js via Chocolatey
choco install nodejs

# Or via Scoop
scoop install nodejs

# Install as Windows Service
npm install -g node-windows
node install-windows-service.js
```

### Docker Production

```dockerfile
# Multi-stage production build
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

## Security Considerations

### Production Security

```bash
# Set secure environment
export NODE_ENV=production

# Use process manager
npm install -g pm2
pm2 start ecosystem.config.js

# Enable firewall (Linux)
sudo ufw allow 3000/tcp

# SSL/TLS (recommended)
npm install --save https
# Configure HTTPS in server configuration
```

### Network Security

```bash
# Bind to localhost only (development)
HOST=127.0.0.1 npm start

# Use reverse proxy (production)
# Configure nginx/apache to proxy to Node.js
```

## Performance Optimization

### Production Tuning

```bash
# Increase file descriptor limits
ulimit -n 65536

# Optimize Node.js flags
node --max-old-space-size=2048 \
     --optimize-for-size \
     self-healing-server.js
```

### Monitoring Setup

```bash
# Install monitoring tools
npm install -g clinic
npm install -g 0x

# Profile performance
clinic doctor -- node self-healing-server.js
```

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Search [existing issues](https://github.com/yourusername/website-inspector-pro/issues)
3. Create a [new issue](https://github.com/yourusername/website-inspector-pro/issues/new) with:
   - System information (`node --version`, `npm --version`, OS)
   - Error messages and logs
   - Steps to reproduce
   - Expected vs actual behavior
