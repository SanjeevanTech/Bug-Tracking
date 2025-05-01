<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bugs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('description');
            $table->enum('status',['open', 'assigned', 'in_progress', 'fixed', 'reopened', 'closed'])->default('open');
            $table->enum('priority',['Low', 'Medium', 'High']);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     
     */
    public function down(): void
    {
        Schema::dropIfExists('bugs');
    }
};
