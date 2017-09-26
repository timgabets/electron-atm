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


  describe('setScreen() and getScreen()', function(){
    it('should set current screen', function(){
      var screen = {
        number: '000',
        actions: [ 
          'clear_screen', 
          Object({ display_image: 'PIC000.jpg' }), 
          Object({ move_cursor: Object({ x: 'O', y: 'F' }) }) 
        ]
      };

      display.setScreen(screen)
      expect(display.getScreen()).toEqual(screen);
    });
  });

  describe('getScreenNumber()', function(){
    it('should get screen number', function(){
      var screen = {
        number: '321',
        actions: [ 
          'clear_screen', 
        ]
      };
      display.setScreen(screen)
      expect(display.getScreenNumber()).toEqual('321');
    })
  });

  describe('getImage()', function(){
    it('should get image', function(){
      var screen = {
        number: '000',
        actions: [ 
          'clear_screen', 
          Object({ display_image: 'PIC789.jpg' })
        ]
      };
      
      display.setScreen(screen)

      expect(display.getImage()).toEqual('PIC789.jpg');
    });
  });

  describe('insertText()', function(){
    it('should insert text into left corner', function(){
      var screen = {
        number: '060',
        actions: [ 
          'clear_screen', 
          Object({ add_text: Object({ 
            '@': '                                ', 
            'A': '                                ', 
            'B': '                                ', 
            'C': '                                ', 
            'D': '                                ', 
            'E': '                                ', 
            'F': '                                ', 
            'G': '        USD                     ', 
            'H': '                                ', 
            'I': '                                ', 
            'J': '                                ', 
            'K': '                                ', 
            'L': '                                ', 
            'M': '                                ', 
            'N': '                                ', 
            'O': '                                '}) 
          }), 
          Object({ move_cursor: Object({ x: '@', y: '@' }) }) 
        ]
      };

      display.setScreen(screen);
      var original_text = screen.actions[1]['add_text'];
      expect(display.getText()).toEqual(original_text);
      
      display.insertText('IDDQD');
      expect(display.getText()['@']).toEqual('IDDQD                           ');
    });

    it('should insert text into the center of display', function(){
      var screen = {
        number: '060',
        actions: [ 
          'clear_screen', 
          Object({ add_text: Object({ 
            '@': '                                ', 
            'A': '                                ', 
            'B': '                                ', 
            'C': '                                ', 
            'D': '                                ', 
            'E': '                                ', 
            'F': '                                ', 
            'G': '        TEXT                    ', 
            'H': '                                ', 
            'I': '                                ', 
            'J': '                                ', 
            'K': '                                ', 
            'L': '                                ', 
            'M': '                                ', 
            'N': '                                ', 
            'O': '                                '}) 
          }), 
          Object({ move_cursor: Object({ x: 'E', y: 'F' }) }) 
        ]
      };

      display.setScreen(screen);
      var original_text = screen.actions[1]['add_text'];
      expect(display.getText()).toEqual(original_text);
      
      display.insertText('LEGIO PATRIA NOSTRA');
      expect(display.getText()['F']).toEqual('     LEGIO PATRIA NOSTRA        ');
    });

    it('should insert masked text', function(){
      var screen = {
        number: '060',
        actions: [ 
          'clear_screen', 
          Object({ add_text: Object({ 
            '@': '                                ', 
            'A': '                                ', 
            'B': '                                ', 
            'C': '                                ', 
            'D': '                                ', 
            'E': '                                ', 
            'F': '                                ', 
            'G': '        TEXT                    ', 
            'H': '                                ', 
            'I': '                                ', 
            'J': '                                ', 
            'K': '                                ', 
            'L': '                                ', 
            'M': '                                ', 
            'N': '                                ', 
            'O': '                                '}) 
          }), 
          Object({ move_cursor: Object({ x: '5', y: 'G' }) }) 
        ]
      };

      display.setScreen(screen);
      var original_text = screen.actions[1]['add_text'];
      expect(display.getText()).toEqual(original_text);
      
      display.insertText('IDDQD', '*');
      expect(display.getText()['G']).toEqual('                     *****      ');
    });
  });
});
