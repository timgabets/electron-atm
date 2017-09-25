describe("DisplayService", function() {
  var DisplayService = require('../../src/services/display.js');
  var log, screens, display;

  beforeEach(function() {
    log = {
      info: function() {
      },
      error: function() {
      }
    };
    
    screens = {
      get: function() {
        return {};
      }
    };

    display = new DisplayService(screens, log);
  });


  describe('setScreen() and setScreen()', function(){
    it('should set current screen', function(){
      var screen = {
        number: '000',
        clear_screen: true,
        display_image_files_control: true,
        image_file: 'PIC000.jpg',
        cursor: { 'x': '@', 'y': '@' }
      };
      display.setScreen(screen)

      expect(display.getScreen()).toEqual(screen);
    });
  });

  describe('getScreenNumber()', function(){
    it('should get screen number', function(){
      display.current_screen = {
        number: '023',
      };
      expect(display.getScreenNumber()).toEqual('023');
    })
  });

  describe('getImage()', function(){
    it('should get image', function(){
      display.current_screen = {
        image_file: 'PIC001.jpg',
      }
      expect(display.getImage()).toEqual('PIC001.jpg');
    });
  });

  describe('insertText()', function(){
    it('should insert text into left corner', function(){
      var screen = {
        number: '039',
        clear_screen: true,
        screen_text: { 
          '@': '                                ', 
          'A': '                                ', 
          'B': '                                ', 
          'C': '                                ', 
          'D': '                                ', 
          'E': '                                ', 
          'F': '                                ', 
          'G': '                                ', 
          'H': '                                ', 
          'I': '                                ', 
          'J': '                                ', 
          'K': '                                ', 
          'L': '                                ', 
          'M': '                                ', 
          'N': '                                ', 
          'O': '                                '
        },
      };

      display.setScreen(screen);
      expect(display.getText()).toEqual(screen.screen_text);
      
      display.insertText('IDDQD');
      expect(display.getText()['@']).toEqual('IDDQD                           ');
    });

    it('should insert text into the center of display', function(){
      var screen = {
        number: '039',
        clear_screen: true,
        screen_text: { 
          '@': 'TEXT                            ', 
          'A': '                                ', 
          'B': '                                ', 
          'C': '                                ', 
          'D': '                                ', 
          'E': '                                ', 
          'F': '                                ', 
          'G': '                                ', 
          'H': '                                ', 
          'I': '                                ', 
          'J': '                                ', 
          'K': '                                ', 
          'L': '                                ', 
          'M': '                                ', 
          'N': '                                ', 
          'O': '                                '
        },
        cursor: { x: 'B', y: 'F' }
      };

      display.setScreen(screen);
      expect(display.getText()).toEqual(screen.screen_text);
      
      display.insertText('LEGIO PATRIA NOSTRA');
      expect(display.getText()['F']).toEqual('  LEGIO PATRIA NOSTRA           ');
    });
  });
});
