# Use Node.js LTS (Long Term Support) as base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies including devDependencies for development
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the development server
CMD ["npm", "run", "dev"]