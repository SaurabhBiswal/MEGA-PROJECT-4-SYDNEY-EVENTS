FROM node:22-slim

# Install system dependencies for Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# SMART COPY: Handle both 'Root Context' and 'Backend Context'
# We copy everything, then check if we are in the root or already in backend
COPY . .

# If 'backend' directory exists, we were built from root. Move it to current dir (/app)
RUN if [ -d "backend" ]; then \
    echo "Detected ROOT context. Flattening backend folder..." && \
    cp -r backend/* ./ && \
    rm -rf backend; \
    fi

# Now install dependencies (omitting dev deps)
# This will find package.json in the current directory (/app)
RUN npm install --omit=dev

# Tell Puppeteer to use the system-installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# Railway/Render specific binding
ENV HOST=0.0.0.0
ENV PORT=5001

# Expose port
EXPOSE 5001

# Start server
CMD ["node", "server.js"]
