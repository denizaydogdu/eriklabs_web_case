# The official Playwright image ships the browsers and system dependencies.
# Its tag must match the Playwright version in package.json, which is pinned
# exactly for that reason -- a floating range would drift away from this image.
FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV HEADLESS=true
ENV CI=true

CMD ["npm", "test"]
