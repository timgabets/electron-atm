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
      expect(s.get()).toEqual({});
      s.init();
      expect(s.get()).toEqual(initialized);
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

  describe('add()', function(){
    beforeEach(function() {
      s.cursor.init();
      s.init();
    });

    it('should add one character', function() {
      expect(s.get()['@'].length).toEqual(32);
      s.add('X');
      expect(s.get()['@'].length).toEqual(32);
      expect(s.get()['@']).toEqual('X                               ')
    });

    it('should replace the character', function() {
      s.add('X');
      expect(s.get()['@']).toEqual('X                               ')
      s.cursor.init();
      s.add('Z');
      expect(s.get()['@']).toEqual('Z                               ')
    });

    it('should change cursor position', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.add('X');
      expect(s.cursor.getPosition()).toEqual({'x': 'A', 'y': '@'})
    });

    it('should add short character string', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.add('IDDQD');
      expect(s.get()['@']).toEqual('IDDQD                           ')
      expect(s.cursor.getPosition()).toEqual({'x': 'E', 'y': '@'});
    });

    it('should replace previous character string', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.add('IDDQD');
      expect(s.get()['@']).toEqual('IDDQD                           ')
      
      s.cursor.init();
      s.add('XYZ');
      expect(s.get()['@']).toEqual('XYZQD                           ')
    });

    it('should carry the text to the next line', function() {
      s.cursor.cursor_position = {'x': 30, 'y': 0}
      expect(s.cursor.getPosition()).toEqual({'x': '>', 'y': '@'});
      s.add('ABCDEFGHI');
      expect(s.get()['@']).toEqual('                              AB')
      expect(s.get()['A']).toEqual('CDEFGHI                         ')
      expect(s.cursor.getPosition()).toEqual({'x': 'G', 'y': 'A'});
    });
  });

  describe('screenTextEmpty()', function(){
    it('should return true is text screen is empty', function(){
      s.init();
      expect(s.screenTextEmpty()).toBeTruthy();
    });

    it('should return false if the text screen is changed', function(){
      s.init();
      s.get()['A'] = 'IDDQD                           ';
      expect(s.screenTextEmpty()).toBeFalsy();
    })
  });
});