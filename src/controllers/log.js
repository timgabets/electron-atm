function Log(){
  this.log = function(data){
    $( _ => {
      $('#log-output').append(data);

      // Scroll the bar down to the bottom
      $('#log-output').scrollTop($('#log-output')[0].scrollHeight);
    })
  }

  this.info = function(data){
    this.log('<p>' + data + '</p>');
  };

  this.warn = function(data){
    this.log('<p>' + data + '</p>');
  };

  this.error = function(data){
    this.log('<p style="color:red">' + data + '</p>');
  };
};

module.exports = Log;
