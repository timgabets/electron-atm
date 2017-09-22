
function DisplayService(screens, log){
  this.screens = screens;
  this.current_screen;

  this.setScreen = function(screen_number){
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

};

module.exports = DisplayService;
