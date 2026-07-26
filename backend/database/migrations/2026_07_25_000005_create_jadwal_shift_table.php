<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_shift', function (Blueprint $table) {
            $table->id();
            $table->string('employee_name');
            $table->string('role'); // waiter|kitchen|manager|owner|admin
            $table->string('schedule')->nullable(); // JSON string jadwal
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_shift');
    }
};
