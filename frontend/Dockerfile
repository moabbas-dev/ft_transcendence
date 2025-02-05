# Use an official Node.js image as base
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend directory
COPY . .

# Expose the frontend port (1234)
EXPOSE 1234

# Start the frontend application
CMD ["npm", "start"]
