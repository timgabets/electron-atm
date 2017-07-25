function ScreensService(){
  this.parseScreen = function(data){
    var parsed = {};
    parsed.number = data.substring(0, 3);

    return parsed;
  }
};

module.exports = ScreensService
