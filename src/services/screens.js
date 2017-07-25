function ScreensService(){
  this.parseScreen = function(data){
    var parsed = {};
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
};

module.exports = ScreensService
