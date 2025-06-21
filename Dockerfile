# Dockerfile for an Expo Web Build

# ---- Base ----
# Start with a Node.js image for the build environment.
# Using a specific version like '18-alpine' is good for reproducibility.
FROM node:18-alpine AS base

# Set the working directory inside the container
WORKDIR /usr/src/app


# ---- Dependencies ----
# This stage is for installing dependencies. It's a separate stage to leverage Docker's layer caching.
# Dependencies will only be re-installed if package.json or package-lock.json changes.
FROM base AS deps

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# If you are using yarn, you would copy yarn.lock instead
# COPY yarn.lock ./

# Install project dependencies
# Using 'npm ci' is recommended for CI/CD environments as it uses package-lock.json for deterministic builds.
RUN npm ci

# If you are using yarn:
# RUN yarn install --frozen-lockfile


# ---- Builder ----
# This stage builds the Expo web application.
FROM deps AS builder

# Copy the rest of your app's source code
COPY . .

# Build the web version of your app using the local Expo CLI.
# The output will be in the 'dist' directory by default with modern Expo.
RUN npx expo export --platform web


# ---- Runner ----
# This is the final stage. We use a lightweight Nginx image to serve the static files.
# This creates a much smaller final image than keeping the whole Node.js environment.
FROM nginx:1.25-alpine AS runner

# Set the working directory for Nginx
WORKDIR /usr/share/nginx/html

# Remove the default Nginx welcome page
RUN rm -rf ./*

# Copy the static build files from the 'builder' stage's 'dist' directory.
COPY --from=builder /usr/src/app/dist .

# Copy the nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
