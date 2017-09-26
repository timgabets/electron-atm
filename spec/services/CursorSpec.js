describe("CursorService", function() {
  var CursorService = require('../../src/services/cursor.js');
  var c;

  beforeEach(function() {
    c = new CursorService();
  });

  describe('insertChar()', function(){
    it('should init cursor position', function(){
      expect(c.cursor_position).toEqual({});
      c.init();
      expect(c.cursor_position).toEqual({'x': 0, 'y': 0});
    });
  });

  describe('getPosition()', function(){
    it('should get left top cursor position', function(){
      c.init();
      expect(c.getPosition()).toEqual({'x': '@', 'y': '@'});
    })

    it('should get right top cursor position', function(){
      c.cursor_position = {'x': 31, 'y': 0};
      expect(c.getPosition()).toEqual({'x': '?', 'y': '@'});
    })

    it('should get bottom left cursor position', function(){
      c.cursor_position = {'x': 0, 'y': 15};
      expect(c.getPosition()).toEqual({'x': '@', 'y': 'O'});
    })

    it('should get bottom right cursor position', function(){
      c.cursor_position = {'x': 31, 'y': 15};
      expect(c.getPosition()).toEqual({'x': '?', 'y': 'O'});
    })

    it('should get center cursor position', function(){
      c.cursor_position = {'x': 15, 'y': 7};
      expect(c.getPosition()).toEqual({'x': 'O', 'y': 'G'});
    })
  });

  describe('setPosition()', function(){
    it('should set cursor position to 2G', function(){
      c.init();
      c.setPosition('G2');
      expect(c.getPosition()).toEqual({'x': '2', 'y': 'G'});
    });

    it('should set cursor position to FK', function(){
      c.init();
      c.setPosition('FK');
      expect(c.getPosition()).toEqual({'x': 'K', 'y': 'F'});
    });

    it('should set cursor position to top left', function(){
      c.init();
      c.setPosition('@@');
      expect(c.getPosition()).toEqual({'x': '@', 'y': '@'});
    });

    it('should set cursor position to top right', function(){
      c.init();
      c.setPosition('@?');
      expect(c.getPosition()).toEqual({'x': '?', 'y': '@'});
    });

    it('should set cursor position to bottom left', function(){
      c.init();
      c.setPosition('O@');
      expect(c.getPosition()).toEqual({'x': '@', 'y': 'O'});
    });

    it('should set cursor position to bottom right', function(){
      c.init();
      c.setPosition('O?');
      expect(c.getPosition()).toEqual({'x': '?', 'y': 'O'});
    });
  });

  describe('copy()', function(){
    it('should copy cursor position from input data', function(){
      c.init();
      expect(c.getPosition()).toEqual({'x': '@', 'y': '@'});
      c.copy({'x': 17, 'y': 13});
      expect(c.getPosition()).toEqual({'x': '1', 'y': 'M'});
    });
  });

  describe('move()', function(){
    it('should move cursor one position to the right', function(){
      c.init();
      expect(c.getPosition()).toEqual({'x': '@', 'y': '@'});
      c.move();
      expect(c.getPosition()).toEqual({'x': 'A', 'y': '@'});
    });

    it('should carry cursor to the next line', function(){
      c.init();
      c.setPosition('B?');
      expect(c.getPosition()).toEqual({'x': '?', 'y': 'B'});
      c.move();
      expect(c.getPosition()).toEqual({'x': '@', 'y': 'C'});
    });

    it('should stay in the right corner in case of screen overflow', function(){
      c.init();
      c.setPosition('O?');
      expect(c.getPosition()).toEqual({'x': '?', 'y': 'O'});
      c.move();
      expect(c.getPosition()).toEqual({'x': '?', 'y': 'O'});
    });
  })


});
