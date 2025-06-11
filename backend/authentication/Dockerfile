# backend/Dockerfile
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

# Copy default avatar (if not already included in COPY . .)
# Make sure binary.png exists in your local uploads directory
COPY ./uploads/binary.png ./uploads/

# Expose the port
EXPOSE 8001

# Start the application
CMD ["node", "index.js"]