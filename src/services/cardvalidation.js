class CardValidationService {
  constructor(settings, log){
    this.settings = settings;
    this.log = log;
  }

  /**
   * [validateMonth description]
   * @param  {[type]} month [description]
   * @return {[type]}       [description]
   */
  validateMonth(month){
    let int_month = parseInt(month, 10);
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
  validateYYMM(date){
    if(date.length !== 4)
      return false;

    let yy = date.substr(0,2);
    let mm = date.substr(2,2);

    if(isNaN(yy) || isNaN(mm))
      return false;

    return this.validateMonth(mm);
  }
}

module.exports = CardValidationService;
