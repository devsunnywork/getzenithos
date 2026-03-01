FROM node:20-slim

# Install Compilers/Interpreters for various languages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-jdk \
    g++ \
    gcc \
    python3 \
    golang && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your server runs on (change if needed)
EXPOSE 3000

# Start the Node.js server
CMD ["npm", "start"]
