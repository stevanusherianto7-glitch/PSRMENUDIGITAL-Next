<?php

use Illuminate\Foundation\Application;

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader.
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel and handle the request.
$app = require_once __DIR__ . '/../bootstrap/app.php';

$app->handleRequest($app->make(Illuminate\Contracts\Http\Kernel::class));
