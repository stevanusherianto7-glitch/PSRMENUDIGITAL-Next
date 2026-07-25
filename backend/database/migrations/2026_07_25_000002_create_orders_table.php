<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('table_id');
            $table->json('items')->nullable();
            $table->bigInteger('subtotal')->default(0);
            $table->bigInteger('total')->default(0);
            $table->text('notes')->nullable();
            $table->string('order_mode')->default('dine-in');
            $table->string('status')->default('pending');
            $table->string('type')->default('guest');
            $table->string('idempotency_key')->nullable()->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
