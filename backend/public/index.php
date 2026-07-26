<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Suppress deprecation noise from framework config under PHP 8.5 (dev only).
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

// Register the Composer autoloader.
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel and handle the request.
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
