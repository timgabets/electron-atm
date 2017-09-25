describe("ScreenTextService", function() {
  var ScreenTextService = require('../../src/services/screentext.js');
  var CursorService = require('../../src/services/cursor.js');
  var s, cursor;

  beforeEach(function() {  
    cursor = new CursorService();
    s = new ScreenTextService(cursor);
  });

  describe('init()', function(){
    it('should init screen text', function() {
      var initialized = { 
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
        'O': '                                ' };
      expect(s.screen_text).toEqual({});
      s.init();
      expect(s.screen_text).toEqual(initialized);
    });
  });

  describe('replaceCharAt()', function(){
    it('should replace symbol in string', function(){
      expect(s.replaceCharAt('iddqd', 1, 'x')).toEqual('ixdqd');
    });

    it('should replace symbol in string', function(){
      expect(s.replaceCharAt('                                ', 0, 'X')).toEqual('X                               ');
    });
  });

  describe('addScreenText()', function(){
    beforeEach(function() {
      s.cursor.init();
      s.init();
    });

    it('should add one character', function() {
      expect(s.screen_text['@'].length).toEqual(32);
      s.addScreenText('X');
      expect(s.screen_text['@'].length).toEqual(32);
      expect(s.screen_text['@']).toEqual('X                               ')
    });

    it('should replace the character', function() {
      s.addScreenText('X');
      expect(s.screen_text['@']).toEqual('X                               ')
      s.cursor.init();
      s.addScreenText('Z');
      expect(s.screen_text['@']).toEqual('Z                               ')
    });

    it('should change cursor position', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('X');
      expect(s.cursor.getPosition()).toEqual({'x': 'A', 'y': '@'})
    });

    it('should add short character string', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('IDDQD');
      expect(s.screen_text['@']).toEqual('IDDQD                           ')
      expect(s.cursor.getPosition()).toEqual({'x': 'E', 'y': '@'});
    });

    it('should replace previous character string', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.addScreenText('IDDQD');
      expect(s.screen_text['@']).toEqual('IDDQD                           ')
      
      s.cursor.init();
      s.addScreenText('XYZ');
      expect(s.screen_text['@']).toEqual('XYZQD                           ')
    });

    it('should carry the text to the next line', function() {
      s.cursor.cursor_position = {'x': 30, 'y': 0}
      expect(s.cursor.getPosition()).toEqual({'x': '>', 'y': '@'});
      s.addScreenText('ABCDEFGHI');
      expect(s.screen_text['@']).toEqual('                              AB')
      expect(s.screen_text['A']).toEqual('CDEFGHI                         ')
      expect(s.cursor.getPosition()).toEqual({'x': 'G', 'y': 'A'});
    });
  });

});