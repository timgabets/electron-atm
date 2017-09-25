
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
      this.text.setCursorPosition(this.current_screen.cursor);

    /*
    if(this.current_screen.clear_screen){
      this.text.init()
    }
    */

    log.info('Screen changed to ' + this.current_screen.number);
    if(this.current_screen.cursor){
      log.info('X: ' + this.current_screen.cursor.x);
      log.info('Y: ' + this.current_screen.cursor.y);
    }
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
   * [getHTML description]
   * @return {[type]} [description]
   */
  this.getHTML = function(){
    return this.text.getHTML();
  };


  /**
   * [getText description]
   * @return {[type]} [description]
   */
  this.getText = function(){
    return this.text.get();
  };

  /**
   * [insertText description]
   * @param  {[type]} text [description]
   * @return {[type]}      [description]
   */
  this.insertText = function(text){
    this.text.add(text);
  };
};

module.exports = DisplayService;
