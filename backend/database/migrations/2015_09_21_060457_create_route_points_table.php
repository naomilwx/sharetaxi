<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRoutePointsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('route_points', function (Blueprint $table) {
            $table->increments('id');
            $table->enum('type', ['start', 'end']);
            $table->integer('route_id')
              ->references('routes')->on('id')
                ->onDelete('cascade');
            $table->string('placeId');
            $table->timestamps();
        });
        DB::statement('alter table route_points add location point');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('route_points');
    }
}
