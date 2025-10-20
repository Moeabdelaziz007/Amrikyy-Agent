# ============================================
# AMRIKYY-AGENT BACKEND - PRODUCTION DOCKERFILE
# Phase 1: Unified Server with TypeScript Support
# ============================================

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY backend/ ./

# Build TypeScript to JavaScript
RUN npm run build

# ============================================
# PRODUCTION IMAGE
# ============================================

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy necessary runtime files
COPY backend/routes ./routes
COPY backend/middleware ./middleware
COPY backend/config ./config

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check (updated for unified server)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Environment variables (to be set at runtime)
ENV NODE_ENV=production

# Start the unified server
CMD ["node", "dist/src/server.js"]
