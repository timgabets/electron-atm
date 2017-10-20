class Log{
  log(data){
    $( _ => {
      $('#log-output').append(data);

      // Scroll the bar down to the bottom
      $('#log-output').scrollTop($('#log-output')[0].scrollHeight);
    })
  }

  info(data){
    this.log('<div>' + data + '</div>');
  };

  warn(data){
    this.log('<p><b>' + data + '</b></p>');
  };

  error(data){
    this.log('<p style="color:red">' + data + '</p>');
  };
};

module.exports = Log;
