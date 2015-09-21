angular.module('models.sharingoptions', [])
.factory('SharingOptions', function(){
  function SharingOptions(){
    this.notes = "";
    this.setCurrentDate();
  }

  function constructArrivalDate(arr_date, arr_time){
    return new Date(arr_date.getFullYear(), arr_date.getMonth(),
     arr_date.getDate(), arr_time.getHours(), arr_time.getMinutes(),
      arr_time.getSeconds(), arr_time.getMilliseconds());
  };

  SharingOptions.prototype.setCurrentDate = function(){
    this.arr_date = new Date();
    this.arr_time = new Date();
    this.arr_time.setMinutes((this.arr_date.getMinutes() + 15));
  };

  SharingOptions.buildFromBackendObject = function(obj){
    var sharingOptions = new SharingOptions();
    sharingOptions.notes = obj.notes;
    sharingOptions.arr_date = obj.arrival_time;
    sharingOptions.arr_time = obj.arrival_time;
    return sharingOptions;
  };

  SharingOptions.prototype.toBackendObject = function(){
    return {
      arrival_time: constructArrivalDate(this.arr_date, this.arr_time),
      notes: this.notes
    }
  };

  return SharingOptions;
});
