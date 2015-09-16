<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFavLocation extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fav_location', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')
              ->references('id')->on('users')
              ->onDelete('cascade');
            $table->double('latitude');
            $table->double('longtitude');
            $table->string('name');
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
        Schema::drop('fav_location');
    }
}
