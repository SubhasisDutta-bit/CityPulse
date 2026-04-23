# Use node image for fast building
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build the Vite application
RUN npm run build

# Install a simple static server
RUN npm install -g serve

# Expose port (Render/Heroku compatible)
EXPOSE 3000

# Serve the static build on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
