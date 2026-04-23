FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
# Install prod dependencies
RUN npm install --production

COPY . .

# Create directory mechanism for the SQLite db so it doesn't fail on boot
RUN touch database.sqlite
RUN chmod 666 database.sqlite

EXPOSE 5000

CMD ["node", "src/index.js"]
