# Use an official Node.js image as base
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend directory
COPY . .

# Expose the frontend port (1234)
EXPOSE 5173

# Start the frontend application
CMD ["npm", "start"]
