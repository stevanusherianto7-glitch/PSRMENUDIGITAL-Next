<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_gallery', function (Blueprint $table) {
            $table->id();
            $table->string('image');
            $table->string('title');
            $table->string('date')->nullable();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_gallery');
    }
};
