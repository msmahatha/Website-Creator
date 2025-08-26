# Use Node.js 16 Alpine for smaller image size
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S inspector -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY . .

# Remove unnecessary files
RUN rm -rf docs/ test/ *.md

# Change ownership to non-root user
RUN chown -R inspector:nodejs /app

# Switch to non-root user
USER inspector

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/ai-health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "self-healing-server.js"]
