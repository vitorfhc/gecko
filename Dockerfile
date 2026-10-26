# Use a light Node.js image
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build for the requested browser (chrome or ff)
ARG TARGET=chrome
RUN npm run build:${TARGET}

# Keep only the built extension, so `docker build --output` exports just dist
FROM scratch
COPY --from=builder /app/dist /
