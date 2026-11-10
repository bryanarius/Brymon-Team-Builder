FROM composer:2 AS composer

WORKDIR /app

COPY composer.json composer.lock* ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

# Compile the React + TypeScript islands into public/build.
# Node is only needed here; the final image stays PHP-only.
FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

COPY tsconfig.json vite.config.mts ./
COPY resources ./resources

RUN npm run build

FROM php:8.3-cli

# Install PostgreSQL PDO driver
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .
COPY --from=composer /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

EXPOSE 10000

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public"]
