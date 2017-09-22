
function DisplayService(screens, log){
  this.screens = screens;
  this.current_screen;
  this.screen_text

  this.setScreen = function(screen){
    this.current_screen = screen;

    // Creating local copies
    if(this.current_screen.screen_text)
      this.screen_text = this.current_screen.screen_text;

    log.info('Screen changed to ' + this.current_screen.number);
  }

  this.setScreenByNumber = function(screen_number){
    var screen = this.screens.get(screen_number)
      if(screen){
        this.setScreen(screen);
      } else {
        log.error('atm.setScreen(): unable to find screen ' + screen_number);
      }
  };

  this.getScreenNumber = function(){
    if(this.current_screen)
      return this.current_screen.number;
  };

  this.getScreen = function(){
    return this.current_screen;
  };

  this.getImage = function(){
    if(this.current_screen)
      return this.current_screen.image_file;
  };

  /**
   * [getText description]
   * @return {[type]} [description]
   */
  this.getText = function(){
    if(this.screen_text){
      var converted = {};

      for (var key in this.screen_text)
        if (this.screen_text.hasOwnProperty(key)){
          converted[key] = this.screen_text[key].split(' ').join('&nbsp');
        }

      return converted;
    }
  };

  this.getCursor = function(){

  };

  this.insertChar = function(char){
    // Take current position
  };
};

module.exports = DisplayService;
