<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeRouteDirectionDatatype extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
       DB::statement('ALTER TABLE routes MODIFY COLUMN direction MEDIUMTEXT');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
       DB::statement('ALTER TABLE routes MODIFY COLUMN direction description TEXT');
    }





}
