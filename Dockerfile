# Multi-stage build for production (npm workspaces: single root lockfile)

# Stage 1: install all workspace dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

# Stage 2: Build Backend
FROM deps AS backend-builder
COPY backend/ backend/
RUN npm run build -w backend

# Stage 3: Build Frontend
FROM deps AS frontend-builder
COPY frontend/ frontend/
RUN npm run build -w frontend

# Stage 4: Production Backend (runtime dependencies only)
FROM node:18-alpine AS backend-prod
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev -w backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/index.js"]

# Stage 5: Production Frontend
FROM node:18-alpine AS frontend-prod
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev -w frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/
WORKDIR /app/frontend
EXPOSE 3001
CMD ["npm", "start"]
