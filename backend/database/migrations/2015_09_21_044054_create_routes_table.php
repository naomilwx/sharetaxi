<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRoutesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('ride_id')
              ->references('rides')->on('id')
                ->onDelete('cascade');
            $table->integer('user_id')
              ->references('users')->on('id')
                ->onDelete('cascade');
            $table->dateTime('startTime');
            $table->dateTime('endTime');
            $table->string('note');
            $table->enum('state', ['requested', 'accepted']);
            $table->json('direction');
            $table->json('delta');
            $table->integer('extends')
              ->nullable()
              ->references('routes')->on('id')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('routes');
    }
}
