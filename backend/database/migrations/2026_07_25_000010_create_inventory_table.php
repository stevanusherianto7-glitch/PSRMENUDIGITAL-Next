<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('qty')->default(0);
            $table->string('unit')->nullable();
            $table->date('exp_date')->nullable();
            $table->string('category')->nullable();
            $table->string('method')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
