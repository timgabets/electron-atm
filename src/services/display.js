
const CursorService = require('../services/cursor.js');
const ScreenTextService = require('../services/screentext.js');

function DisplayService(screens, log){
  this.screens = screens;
  this.current_screen;
  this.cursor = new CursorService();
  this.text = new ScreenTextService(this.cursor);

  this.setScreen = function(screen){
    this.current_screen = screen;

    // Creating local copies
    if(this.current_screen.screen_text)
      this.text.copy(this.current_screen.screen_text);

    if(this.current_screen.cursor)
      this.cursor.copy(this.current_screen.cursor)

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
    return this.text.getHTML();
  };

  this.insertChar = function(char){
    this.cursor.getPosition();
  };
};

module.exports = DisplayService;
