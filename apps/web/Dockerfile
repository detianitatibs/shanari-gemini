# Stage 1: Build the application
FROM node:20-slim AS builder
WORKDIR /usr/src/app

# Copy package files and install dependencies for reproducible builds
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:20-slim
WORKDIR /usr/src/app

# Install gcsfuse for Cloud Storage access, as per design documents
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    gnupg \
    lsb-release \
    curl && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - && \
    apt-get update && apt-get install -y gcsfuse && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy only necessary artifacts from the builder stage
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/next.config.ts ./next.config.ts


EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "start"]

