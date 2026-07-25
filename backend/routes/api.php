<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['app' => 'PSRMENUDIGITAL Backend', 'status' => 'ok']);
});

Route::prefix('api/v1')->group(function () {
    // Health
    Route::get('/ping', fn () => response()->json(['pong' => true]));

    // Auth (Sanctum)
    Route::post('/auth/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login']);
    Route::post('/auth/logout', [\App\Http\Controllers\Api\V1\AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
    // Google OAuth (Socialite)
    Route::get('/auth/google', [\App\Http\Controllers\Api\V1\AuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [\App\Http\Controllers\Api\V1\AuthController::class, 'handleGoogleCallback']);

    // Menus
    Route::apiResource('menus', \App\Http\Controllers\Api\V1\MenuController::class);
    Route::put('/menus/sync', [\App\Http\Controllers\Api\V1\MenuController::class, 'sync']);

    // Event gallery
    Route::apiResource('event-gallery', \App\Http\Controllers\Api\V1\EventGalleryController::class);

    // Orders
    Route::apiResource('orders', \App\Http\Controllers\Api\V1\OrderController::class);

    // Transactions
    Route::apiResource('transactions', \App\Http\Controllers\Api\V1\TransactionController::class);

    // Upload proxy (Cloudinary)
    Route::post('/menu/upload', [\App\Http\Controllers\Api\V1\UploadController::class, 'menu']);
    Route::post('/event-gallery/photo', [\App\Http\Controllers\Api\V1\UploadController::class, 'event']);
});
