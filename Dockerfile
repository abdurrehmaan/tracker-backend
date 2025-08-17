# Dockerfile (for development)
FROM node:20-alpine

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install ALL deps (not just production)
RUN npm install

# Copy rest of the app
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
