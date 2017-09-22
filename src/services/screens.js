const Trace = require('../controllers/trace.js');

// X:
var screen_columns = ['@','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','0','1','2','3','4','5','6','7','8','9',':',';','<','=','>','?'];
// Y:
var screen_rows = ['@','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];

/**
 * [ScreensService description]
 * @param {[type]} settings [description]
 * @param {[type]} log      [description]
 */
function ScreensService(settings, log){
  this.screens = settings.get('screens');
  if(!this.screens)
    this.screens = {};

  this.trace = new Trace();

  this.screen_text = {};
  this.cursor_position = {};
  /**
   * [initScreenText description]
   * @return {[type]} [description]
   */
  this.initScreenText = function(){
    this.screen_text = { '@': '', 'A': '', 'B': '', 'C': '', 'D': '', 'E': '', 'F': '', 'G': '', 'H': '', 'I': '', 'J': '', 'K': '', 'L': '', 'M': '', 'N': '', 'O': '' };
  }

  /**
   * [initCursor description]
   * @return {[type]} [description]
   */
  this.initCursor = function(){
    this.cursor_position = { 'x': 0, 'y': 0 };
  }

  /**
   * [moveCursor move screen cursor {count} positions to the right and carry to the next line if needed]
   * @return {[type]} [description]
   */
  this.moveCursor = function(count){
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

  this.getCursorPosition = function(){
    return {
      'x': screen_columns[this.cursor_position.x], 
      'y': screen_rows[this.cursor_position.y]
    };
  }

  this.addScreenText = function(char){
    this.screen_text[this.cursor_position.x] += char;
  }

  /**
   * [parseScreen description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  this.parseScreen = function(data){
    var parsed = {};
    if(!data)
      return false;

    parsed.number = data.substr(0, 3);
    var i = 3;

    this.initScreenText();
    while(i < data.length){
      if(data[i] === '\x0c'){
        /**
         * FF control character
         * 
         * Clears the screen and positions the cursor in the
         * top left hand corner of the screen. Sets blinking to
         * ‘off’ and resets foreground and background
         * colours to their defaults. NCR recommends you
         * use the FF (form feed) control character at the
         * start of the screen following an idle screen. This
         * ensures the idle sequence is stopped before the
         * next screen is displayed.
         */
        parsed.clear_screen = true;
        i++;
        continue;
      }

      if(data.substr(i, 3) === '\x1bPE'){
        /**
         * Display Image Files Control
         * This control code allows you to display pictures on the screen, using
         * the following control string
         */
        parsed.display_image_files_control = true;
        parsed.image_file = data.substr(i+3).split('\x1b\x5c')[0];

        i += (parsed.image_file.length + ('\x1b\x5c').length);
        continue;
      }

      /**
       * SI Control character
       *
       * 
       */
      if(data[i] === '\x0F'){

      };

      /**
       * ASCII character 
       * 
       */
      if(data[i].charCodeAt(0) >= 32 && data[i].charCodeAt(0) <= 127)
      {

      }

      i++;
    }

    return parsed;
  }

  /**
   * [addScreen description]
   * @param {[type]} screen [description]
   */
  this.addScreen = function(screen){
    var parsed = this.parseScreen(screen);
    if(parsed){
      this.screens[parsed.number] = parsed;
      log.info('\tScreen ' + parsed.number + ' processed (screens overall: ' + Object.keys(this.screens).length + '):' + this.trace.object(parsed));
      settings.set('screens', this.screens);
      return true;
    }
    else
      return false;
  };

  /**
   * [parseDynamicScreenData Parse Dynamic screen data coming from Interactive transaction reply from host.
   *                         As dynamic data comes without screen number, we just appending the fake screen 
   *                         number and parse it as usual]
   * @return {[type]} [parsed screen]
   */
  this.parseDynamicScreenData = function(data){
    var parsed = this.parseScreen('xxx' + data);
    if(parsed)
      parsed.number = 'DYNAMIC';
    return parsed;
  };
};


/**
 * [get description]
 * @param  {[type]} screen_number [description]
 * @return {[type]}              [description]
 */
ScreensService.prototype.get = function(screen_number){
  return this.screens[screen_number];
};


/**
 * [add description]
 * @param {[type]} data [array of data to add]
 * @return {boolean}     [true if data were successfully added, false otherwise]
 */
ScreensService.prototype.add = function(data){
  if(typeof data === 'object') {
    for (var i = 0; i < data.length; i++){
      if(!this.addScreen(data[i])){
        log.info('Error processing screen ' + data[i] );
        return false;
      }
    }
    return true;
  } else if (typeof data === 'string') {
    return this.addScreen(data); 
  } 
}; 

module.exports = ScreensService
