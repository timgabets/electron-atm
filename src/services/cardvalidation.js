function CardValidationService(settings, log){

  this.validateMonth = function(month){
    var int_month = parseInt(month);
    if(isNaN(int_month))
      return false;

    if(int_month <= 0 || int_month > 12)
      return false;

    return true;
  }

  this.validateYYMM = function(date){
    if(date.length !== 4)
      return false;


    return true;
  };
}

module.exports = CardValidationService;
