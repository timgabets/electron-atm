// X:
var screen_columns = ['@','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','0','1','2','3','4','5','6','7','8','9',':',';','<','=','>','?'];
// Y:
var screen_rows = ['@','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];

function CursorService(){
  this.cursor_position = {};

  /**
   * [init description]
   * @return {[type]} [description]
   */
  this.init = function(){
    this.cursor_position = {'x': 0, 'y': 0};
  };

  /**
   * [getPosition description]
   * @return {[type]} [description]
   */
  this.getPosition = function(){
    if(this.cursor_position.x === undefined || this.cursor_position.y === undefined)
      this.init();

    return {
      'x': screen_columns[this.cursor_position.x], 
      'y': screen_rows[this.cursor_position.y]
    };
  }

  /**
   * [set description]
   * @param {[type]} cursor_position [description]
   */
  this.copy = function(cursor_position){
    this.cursor_position = cursor_position;
  };  

  /**
   * [setPosition description]
   * @param {[type]} position_string [description]
   */
  this.setPosition = function(position_string){
    // row selected first, column selected second
    var row = position_string[0];
    var column = position_string[1];

    screen_columns.forEach( (element, i) => {
      if(column === element)
        this.cursor_position.x = i;
    });

    screen_rows.forEach( (element, i) => {
      if(row === element)
        this.cursor_position.y = i;
    });
  }

  /**
   * [move move screen cursor {count} positions to the right and carry to the next line if needed]
   * @return {[type]} [description]
   */
  this.move = function(count){
    if(!count)
      count = 1;

    this.cursor_position.y += Math.floor(count / screen_columns.length);
    this.cursor_position.x += count % screen_columns.length;

    if(this.cursor_position.x >= screen_columns.length){
      this.cursor_position.x = 0;
      this.cursor_position.y += 1;
    }

    if(this.cursor_position.y >= screen_rows.length){
      this.cursor_position.x = screen_columns.length - 1;
      this.cursor_position.y = screen_rows.length - 1;
    }    
  }
};

module.exports = CursorService;
