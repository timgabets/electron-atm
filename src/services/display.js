
const CursorService = require('atm-cursor');
const ScreenTextService = require('atm-screentext');
const Trace = require('atm-trace');

class DisplayService {
  constructor(screens, log){
    this.screens = screens;
    this.log = log;
    this.current_screen;
    this.image_file;
    this.cursor = new CursorService();
    this.text = new ScreenTextService(this.cursor);
    this.trace = new Trace();
  }

  setScreen(screen){
    this.current_screen = screen;

    //log.info(this.trace.object(screen));
    this.current_screen.actions.forEach((element) => {
      if(element === 'clear_screen'){
        this.text.init();        
      } else if( element['display_image'] ) {
        this.image_file = element['display_image'];
      } else if( element['move_cursor'] ){
        this.text.setCursorPosition(element['move_cursor']);
      } else if(element['add_text']){
        this.text.copy(element['add_text']);
      } else if(element['insert_screen']){
        let subscreen = this.screens.get(element['insert_screen']);
        this.setScreen(subscreen);
      }
    });

    this.log.info('Screen changed to ' + this.current_screen.number);
  }

  setScreenByNumber(screen_number){
    let screen = this.screens.get(screen_number);
    if(screen)
      this.setScreen(screen);
    else
      this.log.error('atm.setScreen(): unable to find screen ' + screen_number);
  }

  getScreenNumber(){
    if(this.current_screen)
      return this.current_screen.number;
  }

  getScreen(){
    return this.current_screen;
  }

  getImage(){
    return this.image_file;
  }

  /**
   * [getHTML description]
   * @return {[type]} [description]
   */
  getHTML(){
    return this.text.getHTML();
  }

  /**
   * [getText description]
   * @return {[type]} [description]
   */
  getText(){
    return this.text.get();
  }

  /**
   * [insertText description]
   * @param  {[type]} text [description]
   * @param  {[type]}      [description]
   * @return {[type]}      [description]
   */
  insertText(text, masking_symbol){
    if(masking_symbol)
      text = text.replace(/./gi, masking_symbol);

    this.text.init();
    this.text.put(text);
  }
}

module.exports = DisplayService;
