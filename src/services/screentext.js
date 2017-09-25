function ScreenTextService(cursor){
  this.screen_text = {};
  this.cursor = cursor;

  /**
   * [init description]
   * @return {[type]} [description]
   */
  this.init = function(){
    this.screen_text = { 
      '@': '                                ', 
      'A': '                                ', 
      'B': '                                ', 
      'C': '                                ', 
      'D': '                                ', 
      'E': '                                ', 
      'F': '                                ', 
      'G': '                                ', 
      'H': '                                ', 
      'I': '                                ', 
      'J': '                                ', 
      'K': '                                ', 
      'L': '                                ', 
      'M': '                                ', 
      'N': '                                ', 
      'O': '                                '
    };
  };

  /**
   * [replaceCharAt description]
   * @param  {[type]} string      [description]
   * @param  {[type]} position    [description]
   * @param  {[type]} replacement [description]
   * @return {[type]}             [description]
   */
  this.replaceCharAt = function(string, position, replacement){
    return string.substr(0, position) + replacement + string.substr(position + 1);
  };

  /**
   * [addScreenText description]
   * @param {[type]} text [description]
   */
  this.addScreenText = function(text){
    for(var i = 0; i < text.length; i++){
      var char = text[i];
      var row = this.cursor.getPosition()['y'];
      var column = this.cursor.cursor_position['x'];

      this.screen_text[row] = this.replaceCharAt(this.screen_text[row], column, char);
      this.cursor.move();
    }
  }

};

module.exports = ScreenTextService;