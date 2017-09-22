
function DisplayService(screens, log){
  this.screens = screens;
  this.current_screen;

  this.setScreen = function(screen){
    this.current_screen = screen;
  }

  this.setScreenByNumber = function(screen_number){
    this.current_screen = this.screens.get(screen_number)
      if(this.current_screen){
        log.info('Screen changed to ' + this.current_screen.number);
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

  /* TODO:
    // Replace plain spaces with html-ready &nbsp codes
    if(this.current_screen.screen_text){
      for (var key in this.current_screen.screen_text) {
        if (this.current_screen.screen_text.hasOwnProperty(key))
          this.current_screen.screen_text[key] = this.current_screen.screen_text[key].split(' ').join('&nbsp');
      }
    }
   */

};

module.exports = DisplayService;
