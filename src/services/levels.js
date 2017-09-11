
function LevelsService(){
  this.levels = {};

  this.addState = function(state, level){
    if( !this.levels[level] )
      this.levels[level] = [];
    this.levels[level].push(state);

    return true;
  };

  this.getStates = function(level){
    return this.levels[level];
  }

  this.getLevelSize = function(level){
    if( !this.levels[level] )
      return 0;
    else
      return this.levels[level].length;
  };

  this.getMaxLevel = function(){
    var max = 0;
    for (var key in this.levels)
      if (this.levels.hasOwnProperty(key) && parseInt(key) > max)
        max = parseInt(key);

    return max;
  };
}

module.exports = LevelsService;
