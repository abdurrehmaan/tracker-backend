# Dockerfile (for development)
FROM node:20-alpine

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install ALL deps (not just production)
RUN npm install

# Copy rest of the app
COPY . .

RUN chmod +x node_modules/.bin/ts-node-dev

EXPOSE 4000

CMD ["npm", "run", "dev"]
