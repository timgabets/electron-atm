describe("CursorService", function() {
  var CursorService = require('../../src/services/cursor.js');
  var c;

  beforeEach(function() {
    c = new CursorService();
  });

  describe('insertChar()', function(){
    it('should init cursor position', function(){
      expect(c.cursor_position).toEqual({});
      c.initCursor();
      expect(c.cursor_position).toEqual({'x': 0, 'y': 0});
    });
  });

  describe('getCursorPosition()', function(){
    it('should get left top cursor position', function(){
      c.initCursor();
      expect(c.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
    })

    it('should get right top cursor position', function(){
      c.cursor_position = {'x': 31, 'y': 0};
      expect(c.getCursorPosition()).toEqual({'x': '?', 'y': '@'});
    })

    it('should get bottom left cursor position', function(){
      c.cursor_position = {'x': 0, 'y': 15};
      expect(c.getCursorPosition()).toEqual({'x': '@', 'y': 'O'});
    })

    it('should get bottom right cursor position', function(){
      c.cursor_position = {'x': 31, 'y': 15};
      expect(c.getCursorPosition()).toEqual({'x': '?', 'y': 'O'});
    })

    it('should get center cursor position', function(){
      c.cursor_position = {'x': 15, 'y': 7};
      expect(c.getCursorPosition()).toEqual({'x': 'O', 'y': 'G'});
    })
  });

  describe('setCursorPosition()', function(){
    it('should set cursor position to FK', function(){
      c.initCursor();
      c.setCursorPosition('FK');
      expect(c.getCursorPosition()).toEqual({'x': 'K', 'y': 'F'});
    });

    it('should set cursor position to top left', function(){
      c.initCursor();
      c.setCursorPosition('@@');
      expect(c.getCursorPosition()).toEqual({'x': '@', 'y': '@'});
    });

    it('should set cursor position to top right', function(){
      c.initCursor();
      c.setCursorPosition('@?');
      expect(c.getCursorPosition()).toEqual({'x': '?', 'y': '@'});
    });

    it('should set cursor position to bottom left', function(){
      c.initCursor();
      c.setCursorPosition('O@');
      expect(c.getCursorPosition()).toEqual({'x': '@', 'y': 'O'});
    });

    it('should set cursor position to bottom right', function(){
      c.initCursor();
      c.setCursorPosition('O?');
      expect(c.getCursorPosition()).toEqual({'x': '?', 'y': 'O'});
    });
  })


});
