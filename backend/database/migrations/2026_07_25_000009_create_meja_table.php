<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meja', function (Blueprint $table) {
            $table->id();
            $table->string('label')->unique(); // A1, B2, dll
            $table->boolean('occupied')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meja');
    }
};
