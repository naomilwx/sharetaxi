angular.module('models.sharingoptions', [])
.factory('SharingOptions', function(){
  function SharingOptions(){
    this.dep_date = new Date();
    this.dep_time = new Date();
    this.dep_time.setMinutes(($scope.dep_date.getMinutes() + 15));
    this.notes = "";
  }

  function constructDepartureDate(dep_date, dep_time){
    return new Date(dep_date.getFullYear(), dep_date.getMonth(),
     dep_date.getDate(), dep_time.getHours(), dep_time.getMinutes(),
      dep_time.getSeconds(), dep_time.getMilliseconds());
  }
  SharingOptions.prototype.toBackendObject = function(){
    return {
      departure_time: constructDepartureDate(this.dep_date, this.dep_time),
      notes: this.notes
    }
  };

  return SharingOptions;
});
