# Fly.io compatible Dockerfile for Node/Express API
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port (Fly will map internal 8080/3000, but our app uses PORT env or 5174)
ENV PORT=8080

# Start server
CMD ["node", "index.js"]
