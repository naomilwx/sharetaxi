<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRouteCachesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('route_caches', function (Blueprint $table) {
            $table->increments('id');
            $table->double('startLongtitude');
            $table->double('startLatitude');
            $table->double('endLongtitude');
            $table->double('endLatitude');
            $table->json('routeDescriptor');
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
        Schema::drop('route_caches');
    }
}
