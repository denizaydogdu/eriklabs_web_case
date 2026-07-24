# Tarayicilar ve sistem bagimliliklari hazir geldigi icin resmi Playwright
# imajini kullaniyoruz; imaj surumu package.json'daki Playwright surumu ile
# ayni tutulmalidir.
FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV HEADLESS=true
ENV CI=true

CMD ["npm", "test"]
