function CardValidationService(settings, log){

  /**
   * [validateMonth description]
   * @param  {[type]} month [description]
   * @return {[type]}       [description]
   */
  this.validateMonth = function(month){
    var int_month = parseInt(month);
    if(isNaN(int_month))
      return false;

    if(int_month <= 0 || int_month > 12)
      return false;

    return true;
  }

  /**
   * [validateYYMM description]
   * @param  {[type]} date [description]
   * @return {[type]}      [description]
   */
  this.validateYYMM = function(date){
    if(date.length !== 4)
      return false;

    var yy = date.substr(0,2);
    var mm = date.substr(2,2);

    if(isNaN(yy) || isNaN(mm))
      return false;

    return this.validateMonth(mm);
  };
}

module.exports = CardValidationService;
