function Log(){
  this.log = function(data){
    $( _ => {
      $('#log-output').append('\n' + data);

      // Scroll the bar down to the bottom
      $('#log-output').scrollTop($('#log-output')[0].scrollHeight);
    })
  }
}

module.exports = Log;
