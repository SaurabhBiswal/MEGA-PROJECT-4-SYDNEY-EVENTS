FROM node:22-alpine

# Set working directory
WORKDIR /app

# We are already in the 'backend' folder context (Render Root Directory: backend)
# So we copy package.json directly from the current context
COPY package*.json ./

# Install dependencies (including express)
RUN npm ci --only=production

# Copy all files from the current context (backend folder) to /app
COPY . .

# Expose port
EXPOSE 5001

# Start server
CMD ["node", "server.js"]
