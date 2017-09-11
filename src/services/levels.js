
function LevelsService(){
  this.levels = {};

  /**
   * [addState description]
   * @param {[type]} state [description]
   * @param {[type]} level [description]
   */
  this.addState = function(state, level){
    if( !this.levels[level] )
      this.levels[level] = [];
    this.levels[level].push(state);

    return true;
  };

  /**
   * [getStates description]
   * @param  {[type]} level [description]
   * @return {[type]}       [description]
   */
  this.getStates = function(level){
    return this.levels[level];
  }

  /**
   * [getLevelSize description]
   * @param  {[type]} level [description]
   * @return {[type]}       [description]
   */
  this.getLevelSize = function(level){
    if( !this.levels[level] )
      return 0;
    else
      return this.levels[level].length;
  };

  /**
   * [getMaxLevel description]
   * @return {[type]} [description]
   */
  this.getMaxLevel = function(){
    var max = 0;
    for (var key in this.levels)
      if (this.levels.hasOwnProperty(key) && parseInt(key) > max)
        max = parseInt(key);

    return max;
  };

  /**
   * [clear description]
   * @return {[type]} [description]
   */
  this.clear = function(){
    this.levels = {};
  };
}

module.exports = LevelsService;
