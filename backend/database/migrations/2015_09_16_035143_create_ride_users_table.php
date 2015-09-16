<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRideUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ride_users', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('ride_id')
              ->references('rides')->on('id')
                ->onDelete('cascade');
            $table->integer('user_id')
              ->references('users')->on('id')
                ->onDelete('cascade');;
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
        Schema::drop('ride_users');
    }
}
