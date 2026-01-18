FROM node:22-alpine

WORKDIR /app

# Assume Root Context (Railway Default)
# Copy backend specific files
COPY backend/package*.json ./

# Install production deps
RUN npm ci --only=production

# Copy backend source code
COPY backend/ .

# Expose 5001
EXPOSE 5001

# Start
CMD ["node", "server.js"]
