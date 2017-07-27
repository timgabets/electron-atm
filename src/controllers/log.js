function Log(){
  this.log = function(data){
    $( _ => {
      $('#log-output').append('\n' + data);

      // Scroll the bar down to the bottom
      $('#log-output').scrollTop($('#log-output')[0].scrollHeight);
    })
  }

  this.info = function(data){
    this.log(data);
  };

  this.warn = function(data){
    this.log(data);
  };

  this.err = function(data){
    this.log(data);
  };
};

module.exports = Log;
