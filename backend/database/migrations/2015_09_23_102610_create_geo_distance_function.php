<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGeoDistanceFunction extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::connection()->getPdo()->exec(
          'create function geo_distance(orig point, dest point)
          returns float deterministic
          return 3956 * 2 * ASIN(SQRT( POWER(SIN((x(orig) - x(dest)) *
            pi()/180 / 2), 2) +
            COS(y(orig) * pi()/180) * COS(y(dest) * pi()/180) *
            POWER(SIN((x(orig) - x(dest)) * pi()/180 / 2), 2) ))'
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::connection()->getPdo()->exec('drop function geo_distance');
    }
}
