
# Stage 1: Build TypeScript code
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY tsconfig.json ./
    COPY src ./src
    
    RUN npm run build
    
    
    # -------------------------------
    # Stage 2: Run the app
    # -------------------------------
    FROM node:18-alpine
    
    WORKDIR /app
    
    # Copy only necessary files from builder
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/dist ./dist
    
    EXPOSE 4000
    
    CMD ["node", "dist/server.js"]
    