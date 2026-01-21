# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Build Next.js app
RUN npm run build

# Expose the port Next.js uses
EXPOSE 3000

# Start the app in production
CMD ["npm", "start"]
