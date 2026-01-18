FROM node:22-alpine

# Set working directory to backend folder
WORKDIR /app/backend

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies directly in /app/backend
RUN npm ci --only=production

# Copy the rest of the backend code
COPY backend/ .

# Expose port
EXPOSE 5001

# Start server directly from the backend directory
CMD ["node", "server.js"]
