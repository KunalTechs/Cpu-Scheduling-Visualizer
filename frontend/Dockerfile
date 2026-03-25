FROM node:20-alpine

WORKDIR /app

# 1. Install dependencies first (better for caching)
COPY package*.json ./
RUN npm install

# 2. Copy the rest of the code
COPY . .

# 3. Expose the default Vite port
EXPOSE 5173

# 4. CRITICAL: Add --host to allow external access
CMD ["npm", "run", "dev", "--", "--host"]