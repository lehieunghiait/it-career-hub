# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for environment
ARG BUILD_ENV=production
ARG VITE_BACKEND_URL
ARG VITE_APP_NAME
ARG VITE_CLERK_PUBLISHABLE_KEY

# Set environment variables for build
ENV NODE_ENV=production
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]