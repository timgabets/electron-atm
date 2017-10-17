
const CursorService = require('atm-cursor');
const ScreenTextService = require('../services/screentext.js');
const Trace = require('../controllers/trace.js');

function DisplayService(screens, log){
  this.screens = screens;
  this.current_screen;
  this.image_file;
  this.cursor = new CursorService();
  this.text = new ScreenTextService(this.cursor);
  this.trace = new Trace();

  this.setScreen = function(screen){
    this.current_screen = screen;

    //log.info(this.trace.object(screen));

    this.current_screen.actions.forEach((element) => {
      if(element === 'clear_screen'){
        this.text.init()        
      } else if( element['display_image'] ) {
        this.image_file = element['display_image'];
      } else if( element['move_cursor'] ){
        this.text.setCursorPosition(element['move_cursor']);
      } else if(element['add_text']){
        this.text.copy(element['add_text']);
      } else if(element['insert_screen']){
        var subscreen = this.screens.get(element['insert_screen']);
        this.setScreen(subscreen);
      }
    });

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
    return this.image_file;
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
   * @param  {[type]}      [description]
   * @return {[type]}      [description]
   */
  this.insertText = function(text, masking_symbol){
    if(masking_symbol)
      text = text.replace(/./gi, masking_symbol);

    this.text.init();
    this.text.put(text);
  };
};

module.exports = DisplayService;
