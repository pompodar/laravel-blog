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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Foreign key to the User model
            $table->unsignedBigInteger('post_id'); // Foreign key to the BlogPost model
            $table->unsignedBigInteger('parent_comment_id')->nullable(); // For nested comments
            $table->text('content');
            $table->timestamps();

            // Define foreign keys
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('post_id')->references('id')->on('blog_posts');
            $table->foreign('parent_comment_id')->references('id')->on('comments');
        });
    }

    public function down()
    {
        Schema::dropIfExists('comments');
    }
};
