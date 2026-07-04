FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the backend application code
COPY . .

# Expose the backend port
EXPOSE 5000

# Set environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Run the server
CMD ["node", "server.js"]
