<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserAuthToken extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_auth_token', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')
              ->references('id')->on('users')
              ->onDelete('cascade');
            $table->string('service');
            $table->string('auth');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('user_auth_token');
    }
}
