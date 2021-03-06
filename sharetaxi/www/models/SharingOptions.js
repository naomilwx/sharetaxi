angular.module('models.sharingoptions', [])
.factory('SharingOptions', function(){
  function SharingOptions(){
    this.notes = "";
    this.setCurrentDate();
  }

  SharingOptions.buildFromCachedObject = function(obj){
    var ret = new SharingOptions();
    ret.notes = obj.notes;
    ret.arr_date = ret.parseDate(obj.arr_date);
    ret.arr_time = ret.parseDate(obj.arr_time);
    return ret;
  }

  SharingOptions.prototype.parseDate = function (dateAsString) {
    //Assumes UTC date
    if(dateAsString){
      var parsed = new Date(dateAsString.replace(/-/g, '/'));
      var result = new Date(parsed.setHours(parsed.getHours() + 8));
      return result;
    }else {
      return new Date();
    }

  };

  SharingOptions.prototype.constructArrivalDate = function(){
    var arr_date = this.arr_date;
    var arr_time = this.arr_time;
    var date = new Date(arr_date.getFullYear(), arr_date.getMonth(),
      arr_date.getDate(), arr_time.getHours(), arr_time.getMinutes(),
      arr_time.getSeconds(), arr_time.getMilliseconds());
    return date;
  };

  SharingOptions.prototype.setCurrentDate = function(){
    this.arr_date = new Date();
    this.arr_time = new Date();
    this.arr_time.setMinutes((this.arr_date.getMinutes() + 15));
  };

  SharingOptions.buildFromBackendObject = function(obj){
    var sharingOptions = new SharingOptions();
    sharingOptions.notes = obj.notes;
    sharingOptions.arr_date = sharingOptions.parseDate(obj.arrival_time);
    sharingOptions.arr_time = sharingOptions.parseDate(obj.arrival_time);
    return sharingOptions;
  };

  SharingOptions.prototype.toBackendObject = function(){
    return {
      arrival_time: this.constructArrivalDate(),
      notes: this.notes
    }
  };

  return SharingOptions;
});
