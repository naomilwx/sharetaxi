<?

class RideCompute {
  public function __construct () {
    $this->checkpoints = [];
    $this->routes = [];
  }

  private function queryPath ($src, $dset) {
    $query = [
      'origin' => $src->latitude . ',' . $src->longtitude,
      'destination' => $dest->latitude . ',' .  $dest->longtitude
    ];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,
      'https://maps.googleapis.com/maps/api/directions/json?' .
      http_build_query($query));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $data = curl_exec($ch);
    return json_decode($data);
  }

  public function computeShortestRoute() {
    // get routes
    var $paths = [];
    var $count = count($this->checkpoints);
    for ($i = 0; $i < $count; ++$i) {
      $paths[] = [];
      for ($j = 0; $j < $count; ++$j)
        $paths[][] = [];
    }
    // get pairwise routes
    for ($i = 0; $i < $count; ++$i)
      for ($j = $i + 1; $j < $count; ++$j) {
        $paths[$i][$j] = $this->queryPath($checkpoints[$i], $checkpoints[$j]);
      }
  }

  public function markStart($id) {
    $this->start = $id;
  }

  public function markEnd($id) {
    $this->end = $id;
  }
}
