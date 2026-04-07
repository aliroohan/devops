FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Ensure the server uses the mapped environment variables
EXPOSE 5000

CMD ["npm", "start"]
