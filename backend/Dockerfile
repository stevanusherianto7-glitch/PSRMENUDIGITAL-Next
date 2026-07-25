FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY composer.json ./
RUN composer install --no-interaction --no-scripts --no-dev || true

COPY . .

RUN chown -R www-data:www-data /var/www \
    && php artisan config:cache || true

EXPOSE 9000
