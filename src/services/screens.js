const Trace = require('../controllers/trace.js');

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
      log.log('\tScreen ' + parsed.number + ' processed (screens overall: ' + Object.keys(this.screens).length + '):' + this.trace.object(parsed));
      settings.set('screens', this.screens);
      return true;
    }
    else
      return false;
  };

  /**
   * [add description]
   * @param {[type]} data [array of data to add]
   * @return {boolean}     [true if data were successfully added, false otherwise]
   */
  this.add = function(data){
    if(typeof data === 'object') {
      for (var i = 0; i < data.length; i++){
        if(!this.addScreen(data[i])){
          log.log('Error processing screen ' + data[i] );
          return false;
        }
      }
      return true;
    } else if (typeof data === 'string') {
      return this.addScreen(data); 
    } 
  };  
};


module.exports = ScreensService
