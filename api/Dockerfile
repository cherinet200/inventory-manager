FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy application files from your machine
COPY . .

# Run installation commands
RUN npm install

# Expose the application port
EXPOSE 3000

# Define the command to start your application
CMD ["node", "index.js"]