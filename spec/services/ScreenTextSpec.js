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

  describe('put()', function(){
    beforeEach(function() {
      s.cursor.init();
      s.init();
    });

    it('should put one character', function() {
      expect(s.get()['@'].length).toEqual(32);
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.put('X');
      expect(s.get()['@'].length).toEqual(32);
      expect(s.get()['@']).toEqual('X                               ')
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
    });

    it('should put a short character string', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.put('IDDQD');
      expect(s.get()['@']).toEqual('IDDQD                           ')
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
    });

    it('should replace previous character string', function() {
      expect(s.cursor.getPosition()).toEqual({'x': '@', 'y': '@'});
      s.put('IDDQD');
      expect(s.get()['@']).toEqual('IDDQD                           ')
      
      s.cursor.init();
      s.put('XYZ');
      expect(s.get()['@']).toEqual('XYZQD                           ')
    });

    it('should carry the text to the next line', function() {
      s.cursor.cursor_position = {'x': 30, 'y': 0}
      expect(s.cursor.getPosition()).toEqual({'x': '>', 'y': '@'});
      s.put('ABCDEFGHI');
      expect(s.get()['@']).toEqual('                              AB')
      expect(s.get()['A']).toEqual('CDEFGHI                         ')
      expect(s.cursor.getPosition()).toEqual({'x': '>', 'y': '@'});
    });
  });

  describe('isEmpty()', function(){
    it('should return true is text screen is empty', function(){
      s.init();
      expect(s.isEmpty()).toBeTruthy();
    });

    it('should return false if the text screen is changed', function(){
      s.init();
      s.get()['A'] = 'IDDQD                           ';
      expect(s.isEmpty()).toBeFalsy();
    })
  });

  describe('copy()', function(){
    it('should copy screen text', function(){
      var original = { 
        '@': '                                ', 
        'A': '                                ', 
        'B': '    IDDQD                       ', 
        'C': '                                ', 
        'D': '                                ', 
        'E': '         HGAKJSDH               ', 
        'F': '                                ', 
        'G': '                                ', 
        'H': '                ASASD           ', 
        'I': '                                ', 
        'J': '                                ', 
        'K': '                                ', 
        'L': '                                ', 
        'M': '   126387YAIJSHD98JCLKNALDKS    ', 
        'N': '                        AKJSD2  ', 
        'O': '                               X' ,
      };

      expect(s.get()).toEqual({});
      s.copy(original);
      expect(s.get()).toEqual(original);
    });
  });

  describe('getHTML()', function(){
    it('should get screen text in HTML format', function(){

      var plain = {
        '@': 'TEXT                            ', 
        'A': '                                ', 
        'B': '                                ', 
        'C': '                                ', 
        'D': '        CONVERTED               ', 
        'E': '                                ', 
        'F': '                                ', 
        'G': '               TO               ', 
        'H': '                                ', 
        'I': '                                ', 
        'J': '                                ', 
        'K': '                    HTML        ', 
        'L': '                                ', 
        'M': '                                ', 
        'N': '                                ', 
        'O': '                                '
      };

      converted = {
        '@': 'TEXT&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'A': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'B': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'C': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'D': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspCONVERTED&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'E': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'F': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'G': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTO&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'H': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'I': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'J': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'K': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspHTML&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'L': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'M': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'N': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', 
        'O': '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'
      };

      s.copy(plain);
      expect(s.getHTML()).toEqual(converted);
    });
  });
});